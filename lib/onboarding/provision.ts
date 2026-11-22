import crypto from "crypto";
import { authenticator } from "otplib";
import { prisma } from "@/lib/prisma";
import { hashInvitationToken, InvitationError } from "./invitations";
import { generateSequentialClearanceId } from "@/lib/auth/clearanceId";

/**
 * Atomically consume an invitation and provision the first Hub Manager account.
 *
 * The invitation token is consumed in the same database transaction that
 * creates the organization's Hub and user, so a failed provisioning run
 * cannot silently burn the token without producing an account.
 */
export async function redeemAndProvisionOnboarding(
  rawToken: string,
  opts?: { displayName?: string }
) {
  if (!rawToken || typeof rawToken !== "string") {
    throw new InvitationError(
      "INVITATION_NOT_FOUND",
      "An onboarding token is required."
    );
  }

  const tokenHash = hashInvitationToken(rawToken);
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const invitation = await tx.onboardingInvitation.findUnique({
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

    const consumed = await tx.onboardingInvitation.updateMany({
      where: {
        id: invitation.id,
        consumedAt: null,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: { consumedAt: now },
    });

    if (consumed.count !== 1) {
      throw new InvitationError(
        "INVITATION_EXPIRED",
        "This onboarding invitation has expired or was already used."
      );
    }

    const org = await tx.organization.findUnique({
      where: { id: invitation.orgId },
    });
    if (!org) {
      throw new Error(
        `Organization '${invitation.orgId}' no longer exists.`
      );
    }

    // Provision the customer's first Hub if none exists yet.
    let hub = await tx.hub.findFirst({
      where: { orgId: invitation.orgId },
      orderBy: { createdAt: "asc" },
    });

    if (!hub) {
      const base = `${invitation.orgId}-hub-01`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .slice(0, 40);
      hub = await tx.hub.create({
        data: {
          id: base || `hub-${Date.now()}`,
          orgId: invitation.orgId,
          displayName: `${org.displayName} — Primary Hub`,
          region: org.region || "GL",
          apiKeyHash: crypto.createHash("sha256").update(crypto.randomBytes(32)).digest("hex"),
        },
      });
    }

    // Both invitation roles map to the Hub Manager clearance in this build.
    const role = "HUB_MANAGER" as const;
    const displayName =
      opts?.displayName?.trim() ||
      invitation.recipientName?.trim() ||
      invitation.recipientEmail.split("@")[0];

    const clearanceId = await generateSequentialClearanceId({
      name: displayName,
      role,
      orgName: org.displayName,
      orgId: org.id,
      jurisdiction: org.region,
      region: org.region,
    });

    const totpSecret = authenticator.generateSecret();

    const user = await tx.user.create({
      data: {
        id: clearanceId,
        email: invitation.recipientEmail,
        displayName,
        role,
        orgId: invitation.orgId,
        hubId: hub.id,
        status: "APPROVED",
        totpSecret,
        jurisdiction: org.region || undefined,
      },
    });

    return {
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      orgId: invitation.orgId,
      hubId: hub.id,
      totpSecret,
      otpauthUri: authenticator.keyuri(user.email, "AnimusLab", totpSecret),
    };
  });
}
