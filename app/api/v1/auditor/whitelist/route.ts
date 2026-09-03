import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCredentialWelcomeEmail } from "@/lib/email";
import { authenticator } from "otplib";

export async function GET() {
  try {
    const [auditorUsers, pendingWhitelists] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: { in: ["REGULATORY_AUDITOR", "STANDARD_AUDITOR", "CROSS_HUB_AUDITOR"] },
        },
        include: { organization: true, hub: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.whitelist.findMany({
        where: {
          role: { in: ["REGULATORY_AUDITOR", "STANDARD_AUDITOR", "CROSS_HUB_AUDITOR"] },
          status: "PENDING",
        },
        include: { organization: true, hub: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const formattedPending = pendingWhitelists.map((w) => ({
      id: w.previewClearanceId || w.id,
      email: w.email,
      displayName: w.displayName || w.email.split("@")[0],
      role: w.role,
      status: w.status,
      organization: w.organization || { displayName: w.orgName || "Regulatory Agency" },
      jurisdiction: w.region || "GL",
    }));

    return NextResponse.json({ auditors: [...auditorUsers, ...formattedPending] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch statutory auditors", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, displayName, role, jurisdiction } = body;

    if (!email || !displayName) {
      return NextResponse.json(
        { error: "Email and Display Name are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const targetRole = role || "CROSS_HUB_AUDITOR";
    const targetHubId = body.hubId;

    // 1. Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { hub: true, organization: true },
    });

    if (existing) {
      const isAuditorRole = ["REGULATORY_AUDITOR", "CROSS_HUB_AUDITOR", "STANDARD_AUDITOR"].includes(existing.role);

      if (isAuditorRole) {
        // If a specific hubId is provided, link it
        if (targetHubId) {
          const targetHub = await prisma.hub.findUnique({ where: { id: targetHubId } });
          if (targetHub) {
            await prisma.userHubAssignment.upsert({
              where: {
                userId_hubId: {
                  userId: existing.id,
                  hubId: targetHub.id,
                },
              },
              update: { reason: "Multi-Hub Auditor access expanded" },
              create: {
                userId: existing.id,
                hubId: targetHub.id,
                reason: "Multi-Hub Auditor access granted",
              },
            });

            return NextResponse.json({
              success: true,
              auditor: existing,
              clearanceId: existing.id,
              message: `Cross-Hub Auditor '${existing.displayName}' (${existing.id}) assigned access to Hub '${targetHub.displayName}' (${targetHub.id}).`,
            });
          }
        }

        return NextResponse.json({
          success: true,
          auditor: existing,
          clearanceId: existing.id,
          message: `Auditor '${existing.displayName}' is already active with Clearance ID: ${existing.id}.`,
        });
      }

      // Existing user is an operational developer/manager
      return NextResponse.json(
        {
          error: `Cannot register '${cleanEmail}' as an Auditor: this email is already registered as internal personnel (${existing.role}, Clearance ID: ${existing.id}). Under regulatory compliance rules, auditor identities must be independent from operational personnel.`,
        },
        { status: 409 }
      );
    }

    // 2. Find or create Regulatory Organization
    let regOrg = await prisma.organization.findFirst({
      where: { orgType: "REGULATORY_BODY" },
    });

    if (!regOrg) {
      const domain = `reg-${Date.now()}.animuslab.dev`;
      regOrg = await prisma.organization.create({
        data: {
          id: `org-regulatory-${Date.now()}`,
          displayName: displayName.trim(),
          domain: domain,
          orgType: "REGULATORY_BODY",
          contractTier: "SOVEREIGN",
        },
      });
    }

    // 3. Generate Clearance ID (e.g. AUD-CH-L4 or AUD-REG-892)
    const clearanceId = targetRole === "CROSS_HUB_AUDITOR"
      ? `AUD-CH-L4-${Math.floor(100 + Math.random() * 900)}`
      : `AUD-${jurisdiction ? jurisdiction.toUpperCase() : "REG"}-${Math.floor(100 + Math.random() * 900)}`;

    // 4. Create Statutory Auditor User with unique cryptographically random Base32 TOTP secret
    const uniqueTotpSecret = authenticator.generateSecret();
    const newUser = await prisma.user.create({
      data: {
        id: clearanceId,
        email: cleanEmail,
        displayName: displayName.trim(),
        role: targetRole as any,
        orgId: regOrg.id,
        jurisdiction: jurisdiction || "GL",
        status: "APPROVED",
        totpSecret: uniqueTotpSecret,
      },
      include: { organization: true },
    });

    // 5. If specific target hub is provided, link it via UserHubAssignment
    if (targetHubId) {
      const targetHub = await prisma.hub.findUnique({ where: { id: targetHubId } });
      if (targetHub) {
        await prisma.userHubAssignment.create({
          data: {
            userId: newUser.id,
            hubId: targetHub.id,
            reason: "Initial auditor hub assignment",
          },
        });
      }
    }

    // 6. Also add to Whitelist as approved
    await prisma.whitelist.upsert({
      where: { email: cleanEmail },
      update: {
        status: "APPROVED",
        role: targetRole as any,
        orgId: regOrg.id,
        previewClearanceId: newUser.id,
      },
      create: {
        email: cleanEmail,
        displayName: displayName.trim(),
        orgId: regOrg.id,
        role: targetRole as any,
        status: "APPROVED",
        previewClearanceId: newUser.id,
      },
    });

    // 7. Send Welcome Email via Resend with unique TOTP secret
    sendCredentialWelcomeEmail({
      to: cleanEmail,
      name: displayName.trim(),
      clearanceId: newUser.id,
      hubId: targetHubId || regOrg.id,
      role: targetRole,
      totpSecret: uniqueTotpSecret,
    }).catch((err) => console.error("Auditor welcome email dispatch error:", err));

    return NextResponse.json({
      success: true,
      auditor: newUser,
      clearanceId: newUser.id,
      message: `Statutory Auditor '${newUser.displayName}' whitelisted. Clearance ID: ${newUser.id}`,
    });
  } catch (error: any) {
    console.error("Auditor whitelist error:", error);
    return NextResponse.json(
      { error: "Failed to whitelist auditor. " + (error.message || "") },
      { status: 500 }
    );
  }
}
