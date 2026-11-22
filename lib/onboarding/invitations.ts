import crypto from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * Secure onboarding invitation lifecycle.
 *
 * Security invariants:
 *  - Tokens are generated from cryptographically secure random bytes.
 *  - Only a SHA-256 hash of the token is ever persisted. Plaintext is never stored.
 *  - Tokens are single-use and consumed atomically.
 *  - Tokens are short-lived and revocable.
 *  - Invitations may only be issued once the contract is EXECUTED and its
 *    entitlement grants are ACTIVE (payment received or approved credit terms).
 */

export const INVITATION_TOKEN_BYTES = 32;
export const DEFAULT_INVITATION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export type InvitationErrorCode =
  | "CONTRACT_NOT_FOUND"
  | "CONTRACT_NOT_EXECUTED"
  | "ENTITLEMENTS_NOT_ACTIVE"
  | "INVITATION_NOT_FOUND"
  | "INVITATION_EXPIRED"
  | "INVITATION_REVOKED"
  | "INVITATION_ALREADY_CONSUMED";

export class InvitationError extends Error {
  public code: InvitationErrorCode;

  constructor(code: InvitationErrorCode, message: string) {
    super(message);
    this.name = "InvitationError";
    this.code = code;
  }
}

export function generateInvitationToken(): {
  rawToken: string;
  tokenHash: string;
} {
  const rawToken = crypto
    .randomBytes(INVITATION_TOKEN_BYTES)
    .toString("base64url");
  return { rawToken, tokenHash: hashInvitationToken(rawToken) };
}

export function hashInvitationToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken, "utf8").digest("hex");
}

export function buildOnboardingUrl(rawToken: string): string {
  const base =
    process.env.ANCHOR_ONBOARDING_URL?.replace(/\/$/, "") ||
    "https://hub.animuslab.dev/onboard";
  // Keep the token in the URL fragment so it is not sent in the HTTP request
  // line and is therefore less likely to appear in proxy or server access logs.
  return `${base}#token=${encodeURIComponent(rawToken)}`;
}

export interface CreateInvitationInput {
  orgId: string;
  contractId: string;
  recipientEmail: string;
  recipientName?: string;
  role: "HUB_MANAGER" | "AUTHORISED_SIGNATORY";
  expiresInMs?: number;
}

export interface CreatedInvitation {
  invitationId: string;
  rawToken: string; // returned once, never persisted
  onboardingUrl: string;
  expiresAt: Date;
}

/**
 * Issue a single-use onboarding invitation.
 * Enforces the activation state machine: contract executed + entitlements active.
 */
export async function createOnboardingInvitation(
  input: CreateInvitationInput
): Promise<CreatedInvitation> {
  const contract = await prisma.contract.findUnique({
    where: { id: input.contractId },
    include: { entitlements: true },
  });

  if (!contract) {
    throw new InvitationError(
      "CONTRACT_NOT_FOUND",
      `Contract '${input.contractId}' does not exist.`
    );
  }

  if (contract.contractStatus !== "EXECUTED") {
    throw new InvitationError(
      "CONTRACT_NOT_EXECUTED",
      `Cannot issue onboarding invitation: contract status is '${contract.contractStatus}', expected 'EXECUTED'.`
    );
  }

  const now = new Date();
  const activeGrants = contract.entitlements.filter(
    (g) =>
      g.status === "ACTIVE" &&
      g.effectiveFrom <= now &&
      g.effectiveUntil >= now
  );

  if (activeGrants.length === 0) {
    throw new InvitationError(
      "ENTITLEMENTS_NOT_ACTIVE",
      "Cannot issue onboarding invitation: no ACTIVE entitlement grants. " +
        "Confirm invoice settlement or approved credit terms before provisioning access."
    );
  }

  const { rawToken, tokenHash } = generateInvitationToken();
  const expiresAt = new Date(
    now.getTime() + (input.expiresInMs ?? DEFAULT_INVITATION_TTL_MS)
  );

  const invitation = await prisma.onboardingInvitation.create({
    data: {
      orgId: input.orgId,
      contractId: input.contractId,
      recipientEmail: input.recipientEmail.toLowerCase().trim(),
      recipientName: input.recipientName,
      role: input.role,
      tokenHash,
      expiresAt,
      deliveryStatus: "PENDING",
    },
  });

  return {
    invitationId: invitation.id,
    rawToken,
    onboardingUrl: buildOnboardingUrl(rawToken),
    expiresAt,
  };
}

/**
 * Atomically redeem an invitation token. Exactly one caller can succeed,
 * even under concurrent redemption attempts.
 */
export async function redeemOnboardingInvitation(
  rawToken: string
): Promise<{ invitationId: string; orgId: string; contractId: string; role: string }> {
  if (!rawToken || typeof rawToken !== "string") {
    throw new InvitationError(
      "INVITATION_NOT_FOUND",
      "An onboarding token is required."
    );
  }

  const tokenHash = hashInvitationToken(rawToken);
  const invitation = await prisma.onboardingInvitation.findUnique({
    where: { tokenHash },
  });

  if (!invitation) {
    throw new InvitationError(
      "INVITATION_NOT_FOUND",
      "This onboarding invitation is invalid."
    );
  }

  if (invitation.revokedAt) {
    throw new InvitationError(
      "INVITATION_REVOKED",
      "This onboarding invitation has been revoked."
    );
  }

  if (invitation.consumedAt) {
    throw new InvitationError(
      "INVITATION_ALREADY_CONSUMED",
      "This onboarding invitation has already been used."
    );
  }

  const now = new Date();

  // Atomic single-use consumption: only one conditional update can match.
  const consumed = await prisma.onboardingInvitation.updateMany({
    where: {
      id: invitation.id,
      consumedAt: null,
      revokedAt: null,
      expiresAt: { gt: now },
    },
    data: { consumedAt: now },
  });

  if (consumed.count !== 1) {
    // Re-read to report the precise reason.
    const latest = await prisma.onboardingInvitation.findUnique({
      where: { id: invitation.id },
    });
    if (latest?.consumedAt) {
      throw new InvitationError(
        "INVITATION_ALREADY_CONSUMED",
        "This onboarding invitation has already been used."
      );
    }
    if (latest?.revokedAt) {
      throw new InvitationError(
        "INVITATION_REVOKED",
        "This onboarding invitation has been revoked."
      );
    }
    throw new InvitationError(
      "INVITATION_EXPIRED",
      "This onboarding invitation has expired."
    );
  }

  return {
    invitationId: invitation.id,
    orgId: invitation.orgId,
    contractId: invitation.contractId,
    role: invitation.role,
  };
}

/**
 * Revoke a pending invitation. Idempotent for already-revoked invitations.
 */
export async function revokeOnboardingInvitation(
  invitationId: string,
  revokedBy: string
): Promise<void> {
  const invitation = await prisma.onboardingInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    throw new InvitationError(
      "INVITATION_NOT_FOUND",
      `Invitation '${invitationId}' does not exist.`
    );
  }

  if (invitation.consumedAt) {
    throw new InvitationError(
      "INVITATION_ALREADY_CONSUMED",
      "Consumed invitations cannot be revoked."
    );
  }

  await prisma.onboardingInvitation.update({
    where: { id: invitationId },
    data: { revokedAt: new Date(), revokedBy },
  });
}

/**
 * Mark an invitation as delivered after the email has been dispatched.
 */
export async function markInvitationDelivered(
  invitationId: string,
  status: "SENT" | "FAILED"
): Promise<void> {
  await prisma.onboardingInvitation.update({
    where: { id: invitationId },
    data: { deliveryStatus: status, deliveredAt: new Date() },
  });
}
