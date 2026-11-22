/**
 * Integration test: Secure onboarding invitation lifecycle.
 * Runs against the live database and cleans up after itself.
 */
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import {
  createOnboardingInvitation,
  redeemOnboardingInvitation,
  revokeOnboardingInvitation,
  hashInvitationToken,
  buildOnboardingUrl,
  InvitationError,
} from "../lib/onboarding/invitations";

const RUN = Date.now();
const ORG_ID = `test-org-onb-${RUN}`;
const DOMAIN = `onb-${RUN}.test`;
const QUOTE_REF = `ANC-Q-TEST-${RUN}`;
const CONTRACT_REF = `ANC-CON-TEST-${RUN}`;

let passed = 0;
let failed = 0;

function ok(name: string) {
  passed++;
  console.log(`  PASS  ${name}`);
}

function fail(name: string, detail: string) {
  failed++;
  console.log(`  FAIL  ${name}\n        ${detail}`);
}

async function expectCode(
  name: string,
  fn: () => Promise<unknown>,
  code: string
) {
  try {
    await fn();
    fail(name, `expected InvitationError '${code}' but call succeeded`);
  } catch (err) {
    if (err instanceof InvitationError && err.code === code) {
      ok(name);
    } else {
      fail(
        name,
        `expected '${code}', got ${(err as Error).name}: ${(err as Error).message}`
      );
    }
  }
}

async function main() {
  console.log("\n=== Onboarding Invitation Lifecycle Test ===\n");

  // ── Fixtures ──────────────────────────────────────────────────────────────
  await prisma.organization.create({
    data: {
      id: ORG_ID,
      displayName: "Onboarding Test Org",
      domain: DOMAIN,
      region: "EU",
    },
  });

  const quote = await prisma.quote.create({
    data: {
      referenceNumber: QUOTE_REF,
      orgId: ORG_ID,
      companyLegalName: "Onboarding Test Ltd.",
      companyCountry: "GB",
      contactName: "Test Contact",
      contactEmail: "contact@onb.test",
      packageTier: "PROFESSIONAL",
      termYears: 1,
      annualListPrice: "94000.00",
      bundleDiscount: "14100.00",
      termDiscount: "0.00",
      netAnnualPrice: "79900.00",
      totalContract: "79900.00",
      status: "ACCEPTED",
    },
  });

  const contract = await prisma.contract.create({
    data: {
      referenceNumber: CONTRACT_REF,
      quoteId: quote.id,
      orgId: ORG_ID,
      contractStatus: "EXECUTED",
      paymentStatus: "PAID",
    },
  });

  // Start with a PENDING grant to prove the activation gate.
  const grant = await prisma.entitlementGrant.create({
    data: {
      orgId: ORG_ID,
      contractId: contract.id,
      featureCode: "GOVERNED_AI_MODEL_SLOTS",
      aggregationType: "ADDITIVE",
      scope: "ORGANIZATION",
      limitValue: 3,
      effectiveFrom: new Date(Date.now() - 60_000),
      effectiveUntil: new Date(Date.now() + 365 * 24 * 3600 * 1000),
      status: "PENDING",
    },
  });

  // ── 1. Activation gate ────────────────────────────────────────────────────
  await expectCode(
    "Rejects invitation while entitlements are PENDING",
    () =>
      createOnboardingInvitation({
        orgId: ORG_ID,
        contractId: contract.id,
        recipientEmail: "manager@onb.test",
        role: "HUB_MANAGER",
      }),
    "ENTITLEMENTS_NOT_ACTIVE"
  );

  await prisma.entitlementGrant.update({
    where: { id: grant.id },
    data: { status: "ACTIVE" },
  });
  ok("Entitlement grant activated for the remainder of the test");

  // ── 2. Token generation + hash-only storage ───────────────────────────────
  const created = await createOnboardingInvitation({
    orgId: ORG_ID,
    contractId: contract.id,
    recipientEmail: "Manager@Onb.Test",
    recipientName: "Marcus Vance",
    role: "HUB_MANAGER",
  });

  const stored = await prisma.onboardingInvitation.findUnique({
    where: { id: created.invitationId },
  });

  if (!stored) {
    fail("Invitation persisted", "row not found");
  } else {
    ok("Invitation persisted");
    if (stored.tokenHash === created.rawToken) {
      fail("Token stored only as hash", "plaintext token was persisted");
    } else {
      ok("Token stored only as hash");
    }
    if (stored.tokenHash === hashInvitationToken(created.rawToken)) {
      ok("Stored hash matches SHA-256 of raw token");
    } else {
      fail("Stored hash matches SHA-256 of raw token", "hash mismatch");
    }
    if (stored.recipientEmail === "manager@onb.test") {
      ok("Recipient email normalized to lowercase");
    } else {
      fail("Recipient email normalized", `got '${stored.recipientEmail}'`);
    }
    if (stored.expiresAt.getTime() > Date.now()) {
      ok("Invitation has a future expiry (~7 days)");
    } else {
      fail("Invitation has a future expiry", `expiresAt=${stored.expiresAt}`);
    }
    if (created.onboardingUrl.startsWith("https://hub.animuslab.dev/onboard#token=")) {
      ok("Onboarding URL uses the documented endpoint");
    } else {
      fail("Onboarding URL endpoint", created.onboardingUrl);
    }
    if (buildOnboardingUrl(created.rawToken).includes(encodeURIComponent(created.rawToken))) {
      ok("Onboarding URL carries the raw token (delivered privately)");
    } else {
      fail("Onboarding URL token", "raw token missing from URL");
    }
  }

  // ── 3. Wrong token rejected ───────────────────────────────────────────────
  await expectCode(
    "Rejects an unknown token",
    () => redeemOnboardingInvitation("not-a-real-token"),
    "INVITATION_NOT_FOUND"
  );

  // ── 4. Successful single-use redemption ───────────────────────────────────
  const redeemed = await redeemOnboardingInvitation(created.rawToken);
  if (redeemed.invitationId === created.invitationId) {
    ok("Valid token redeems successfully");
  } else {
    fail("Valid token redeems successfully", "invitation id mismatch");
  }

  await expectCode(
    "Rejects replay of the same token",
    () => redeemOnboardingInvitation(created.rawToken),
    "INVITATION_ALREADY_CONSUMED"
  );

  // ── 5. Concurrent redemption: exactly one winner ──────────────────────────
  const created2 = await createOnboardingInvitation({
    orgId: ORG_ID,
    contractId: contract.id,
    recipientEmail: "signatory@onb.test",
    role: "AUTHORISED_SIGNATORY",
  });

  const results = await Promise.allSettled([
    redeemOnboardingInvitation(created2.rawToken),
    redeemOnboardingInvitation(created2.rawToken),
    redeemOnboardingInvitation(created2.rawToken),
  ]);
  const successes = results.filter((r) => r.status === "fulfilled").length;
  const consumedErrors = results.filter(
    (r) =>
      r.status === "rejected" &&
      r.reason instanceof InvitationError &&
      r.reason.code === "INVITATION_ALREADY_CONSUMED"
  ).length;

  if (successes === 1 && consumedErrors === results.length - 1) {
    ok("Concurrent redemption: exactly one succeeds");
  } else {
    fail(
      "Concurrent redemption: exactly one succeeds",
      `successes=${successes}, consumedRejections=${consumedErrors}`
    );
  }

  // ── 6. Revocation ─────────────────────────────────────────────────────────
  const created3 = await createOnboardingInvitation({
    orgId: ORG_ID,
    contractId: contract.id,
    recipientEmail: "revoked@onb.test",
    role: "HUB_MANAGER",
  });

  await revokeOnboardingInvitation(created3.invitationId, "admin-test");
  const revokedRow = await prisma.onboardingInvitation.findUnique({
    where: { id: created3.invitationId },
  });
  if (revokedRow?.revokedAt && revokedRow.revokedBy === "admin-test") {
    ok("Revocation records revokedAt and revokedBy");
  } else {
    fail("Revocation records audit fields", JSON.stringify(revokedRow));
  }

  await expectCode(
    "Rejects a revoked token",
    () => redeemOnboardingInvitation(created3.rawToken),
    "INVITATION_REVOKED"
  );

  // ── 7. Expiry ─────────────────────────────────────────────────────────────
  const created4 = await createOnboardingInvitation({
    orgId: ORG_ID,
    contractId: contract.id,
    recipientEmail: "expired@onb.test",
    role: "HUB_MANAGER",
    expiresInMs: -60_000,
  });

  await expectCode(
    "Rejects an expired token",
    () => redeemOnboardingInvitation(created4.rawToken),
    "INVITATION_EXPIRED"
  );

  // ── 8. Contract must be EXECUTED ──────────────────────────────────────────
  await prisma.contract.update({
    where: { id: contract.id },
    data: { contractStatus: "AWAITING_CUSTOMER_SIGNATURE" },
  });

  await expectCode(
    "Rejects invitation for an unsigned contract",
    () =>
      createOnboardingInvitation({
        orgId: ORG_ID,
        contractId: contract.id,
        recipientEmail: "manager@onb.test",
        role: "HUB_MANAGER",
      }),
    "CONTRACT_NOT_EXECUTED"
  );

  await prisma.contract.update({
    where: { id: contract.id },
    data: { contractStatus: "EXECUTED" },
  });

  // ── 9. No plaintext token leakage in DB sweep ─────────────────────────────
  const allRows = await prisma.onboardingInvitation.findMany({
    where: { orgId: ORG_ID },
  });
  const leaked = allRows.some(
    (r) =>
      r.tokenHash === created.rawToken ||
      r.tokenHash === created2.rawToken ||
      r.tokenHash === created3.rawToken ||
      r.tokenHash === created4.rawToken
  );
  if (!leaked) {
    ok(`No plaintext token in ${allRows.length} invitation rows`);
  } else {
    fail("No plaintext token in database", "raw token found in tokenHash column");
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────
  await prisma.onboardingInvitation.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.entitlementGrant.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.contract.delete({ where: { id: contract.id } });
  await prisma.quote.delete({ where: { id: quote.id } });
  await prisma.organization.delete({ where: { id: ORG_ID } });
  console.log("\n  Cleanup complete.");

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) process.exitCode = 1;
}

main()
  .catch(async (err) => {
    console.error("\nFATAL:", err);
    // Best-effort cleanup on fatal error.
    try {
      await prisma.onboardingInvitation.deleteMany({ where: { orgId: ORG_ID } });
      await prisma.entitlementGrant.deleteMany({ where: { orgId: ORG_ID } });
      await prisma.contract.deleteMany({ where: { referenceNumber: CONTRACT_REF } });
      await prisma.quote.deleteMany({ where: { referenceNumber: QUOTE_REF } });
      await prisma.organization.deleteMany({ where: { id: ORG_ID } });
    } catch {
      /* ignore cleanup failures */
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
