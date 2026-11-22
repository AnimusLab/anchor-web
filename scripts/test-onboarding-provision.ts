/**
 * Integration test: redeem an invitation and provision a Hub Manager account.
 */
import { prisma } from "../lib/prisma";
import {
  createOnboardingInvitation,
  InvitationError,
} from "../lib/onboarding/invitations";
import { redeemAndProvisionOnboarding } from "../lib/onboarding/provision";

const RUN = Date.now();
const ORG_ID = `test-org-prov-${RUN}`;
const DOMAIN = `prov-${RUN}.test`;
const QUOTE_REF = `ANC-Q-PROV-${RUN}`;
const CONTRACT_REF = `ANC-CON-PROV-${RUN}`;
const EMAIL = `manager-${RUN}@prov.test`;

let passed = 0;
let failed = 0;
const ok = (n: string) => { passed++; console.log(`  PASS  ${n}`); };
const bad = (n: string, d: string) => { failed++; console.log(`  FAIL  ${n}\n        ${d}`); };

async function main() {
  console.log("\n=== Onboarding Provisioning Test ===\n");

  await prisma.organization.create({
    data: { id: ORG_ID, displayName: "Provision Test Org", domain: DOMAIN, region: "EU" },
  });
  const quote = await prisma.quote.create({
    data: {
      referenceNumber: QUOTE_REF,
      orgId: ORG_ID,
      companyLegalName: "Provision Test Ltd.",
      companyCountry: "GB",
      contactName: "Test",
      contactEmail: "t@prov.test",
      packageTier: "PROFESSIONAL",
      annualListPrice: "100.00",
      bundleDiscount: "0.00",
      termDiscount: "0.00",
      netAnnualPrice: "100.00",
      totalContract: "100.00",
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
  await prisma.entitlementGrant.create({
    data: {
      orgId: ORG_ID,
      contractId: contract.id,
      featureCode: "GOVERNED_AI_MODEL_SLOTS",
      limitValue: 1,
      effectiveFrom: new Date(Date.now() - 60_000),
      effectiveUntil: new Date(Date.now() + 86_400_000),
      status: "ACTIVE",
    },
  });

  const inv = await createOnboardingInvitation({
    orgId: ORG_ID,
    contractId: contract.id,
    recipientEmail: EMAIL,
    recipientName: "Elena Rostova",
    role: "HUB_MANAGER",
  });
  ok("Invitation issued");

  const provisioned = await redeemAndProvisionOnboarding(inv.rawToken);

  const user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (user && user.id === provisioned.userId) ok("User provisioned with clearance ID");
  else bad("User provisioned", JSON.stringify(user));

  if (user?.status === "APPROVED") ok("User status APPROVED");
  else bad("User status APPROVED", String(user?.status));

  if (user?.role === "HUB_MANAGER") ok("User role HUB_MANAGER");
  else bad("User role HUB_MANAGER", String(user?.role));

  if (user?.totpSecret && user.totpSecret.length >= 16) ok("TOTP secret generated");
  else bad("TOTP secret generated", String(user?.totpSecret));

  if (user?.hubId) ok(`Hub assigned (${user.hubId})`);
  else bad("Hub assigned", String(user?.hubId));

  const stored = await prisma.onboardingInvitation.findUnique({
    where: { id: inv.invitationId },
  });
  if (stored?.consumedAt) ok("Invitation marked consumed in same transaction");
  else bad("Invitation consumed", JSON.stringify(stored?.consumedAt));

  try {
    await redeemAndProvisionOnboarding(inv.rawToken);
    bad("Replay rejected", "second redemption succeeded");
  } catch (err) {
    if (err instanceof InvitationError && err.code === "INVITATION_ALREADY_CONSUMED") {
      ok("Replay rejected (INVITATION_ALREADY_CONSUMED)");
    } else {
      bad("Replay rejected", `${(err as Error).name}: ${(err as Error).message}`);
    }
  }

  // Cleanup
  if (user) await prisma.user.delete({ where: { id: user.id } });
  const hubId = user?.hubId;
  await prisma.onboardingInvitation.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.entitlementGrant.deleteMany({ where: { orgId: ORG_ID } });
  await prisma.contract.delete({ where: { id: contract.id } });
  await prisma.quote.delete({ where: { id: quote.id } });
  if (hubId) {
    await prisma.hub.deleteMany({ where: { id: hubId } });
  }
  await prisma.organization.delete({ where: { id: ORG_ID } });
  console.log("\n  Cleanup complete.");
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  if (failed) process.exitCode = 1;
}

main()
  .catch(async (e) => {
    console.error("\nFATAL:", e);
    try {
      await prisma.onboardingInvitation.deleteMany({ where: { orgId: ORG_ID } });
      await prisma.entitlementGrant.deleteMany({ where: { orgId: ORG_ID } });
      await prisma.contract.deleteMany({ where: { referenceNumber: CONTRACT_REF } });
      await prisma.quote.deleteMany({ where: { referenceNumber: QUOTE_REF } });
      await prisma.hub.deleteMany({ where: { orgId: ORG_ID } });
      await prisma.user.deleteMany({ where: { email: EMAIL } });
      await prisma.organization.deleteMany({ where: { id: ORG_ID } });
    } catch {}
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
