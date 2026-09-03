import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCredentialWelcomeEmail } from "@/lib/email";
import { generateClearanceId } from "@/lib/auth/clearanceId";
import { authenticator } from "otplib";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hubId, email, name, role } = body;

    if (!hubId || !email || !name) {
      return NextResponse.json(
        { error: "Hub ID, Personnel Email, and Full Name are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const targetRole = role || "DEVELOPER";

    // 1. Verify Hub exists
    const hub = await prisma.hub.findUnique({
      where: { id: hubId },
      include: { organization: true },
    });

    if (!hub) {
      return NextResponse.json(
        { error: `Hub Node '${hubId}' not found.` },
        { status: 404 }
      );
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { hub: true, organization: true },
    });

    if (existingUser) {
      const isAuditorRole = ["CROSS_HUB_AUDITOR", "REGULATORY_AUDITOR", "STANDARD_AUDITOR"].includes(existingUser.role);

      // Scenario A: Existing User is a Cross-Hub / Regulatory Auditor -> Link to this Hub via UserHubAssignment
      if (isAuditorRole) {
        const existingAssignment = await prisma.userHubAssignment.findUnique({
          where: {
            userId_hubId: {
              userId: existingUser.id,
              hubId: hub.id,
            },
          },
        });

        if (!existingAssignment) {
          await prisma.userHubAssignment.create({
            data: {
              userId: existingUser.id,
              hubId: hub.id,
              reason: "Multi-Hub Auditor access granted",
            },
          });
        }

        return NextResponse.json({
          success: true,
          user: existingUser,
          clearanceId: existingUser.id,
          message: `Cross-Hub Auditor '${existingUser.displayName}' (${existingUser.id}) assigned access to Hub '${hub.displayName}' (${hub.id}).`,
        });
      }

      // Scenario B: Existing User is internal personnel (Manager / Dev / Lead)
      if (existingUser.hubId === hub.id) {
        if (existingUser.role === targetRole) {
          return NextResponse.json({
            success: true,
            user: existingUser,
            clearanceId: existingUser.id,
            message: `Personnel '${cleanName}' is already active on Hub '${hub.displayName}' as ${existingUser.role} (Clearance ID: ${existingUser.id}).`,
          });
        }

        return NextResponse.json(
          {
            error: `Personnel '${cleanName}' is already registered on Hub '${hub.id}' as ${existingUser.role} (Clearance ID: ${existingUser.id}). A single personnel identity cannot hold dual conflicting roles on the same Hub.`,
          },
          { status: 409 }
        );
      }

      // Scenario C: User is registered on a different Hub
      return NextResponse.json(
        {
          error: `Personnel '${cleanName}' is already assigned to Hub '${existingUser.hubId}' as ${existingUser.role} (Clearance ID: ${existingUser.id}). Enterprise operational personnel must have unique assigned identities per Hub.`,
        },
        { status: 409 }
      );
    }

    // 3. Generate Unique Clearance ID (with auto-sequence collision resolver)
    let seq = 1;
    let clearanceId = generateClearanceId(cleanName, targetRole);
    while (await prisma.user.findUnique({ where: { id: clearanceId } })) {
      seq += 1;
      clearanceId = generateClearanceId(cleanName, targetRole, seq);
    }

    // 4. Create new User row with unique cryptographically random Base32 TOTP secret
    const uniqueTotpSecret = authenticator.generateSecret();
    const user = await prisma.user.create({
      data: {
        id: clearanceId,
        email: cleanEmail,
        displayName: cleanName,
        role: targetRole as any,
        orgId: hub.orgId,
        hubId: hub.id,
        status: "APPROVED",
        totpSecret: uniqueTotpSecret,
      },
      include: { organization: true, hub: true },
    });

    // 5. Create Hub Assignment Record
    await prisma.userHubAssignment.create({
      data: {
        userId: user.id,
        hubId: hub.id,
        reason: "Primary hub clearance assignment",
      },
    });

    // 6. Upsert Whitelist entry
    await prisma.whitelist.upsert({
      where: { email: cleanEmail },
      update: {
        status: "APPROVED",
        role: targetRole as any,
        orgId: hub.orgId,
        hubId: hub.id,
        previewClearanceId: user.id,
      },
      create: {
        email: cleanEmail,
        displayName: cleanName,
        orgId: hub.orgId,
        hubId: hub.id,
        role: targetRole as any,
        status: "APPROVED",
        previewClearanceId: user.id,
      },
    });

    // 7. Send Welcome Email via Resend with unique TOTP secret
    sendCredentialWelcomeEmail({
      to: cleanEmail,
      name: cleanName,
      clearanceId: user.id,
      hubId: hub.id,
      role: targetRole,
      totpSecret: uniqueTotpSecret,
    }).catch((err) => console.error("Welcome email dispatch error:", err));

    return NextResponse.json({
      success: true,
      user,
      clearanceId: user.id,
      message: `Personnel '${cleanName}' whitelisted under Hub '${hub.displayName}' (${hub.id}). Clearance ID: ${user.id}`,
    });
  } catch (error: any) {
    console.error("Hub Personnel Whitelist error:", error);
    return NextResponse.json(
      { error: "Failed to whitelist personnel. " + (error.message || "") },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const hubId = searchParams.get("hubId");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required to revoke whitelist status." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Remove from Whitelist table
    await prisma.whitelist.deleteMany({
      where: { email: cleanEmail },
    });

    // 2. Remove or reset from User table
    await prisma.user.deleteMany({
      where: { email: cleanEmail },
    });

    return NextResponse.json({
      success: true,
      message: `Personnel '${cleanEmail}' successfully removed from whitelist.`,
    });
  } catch (error: any) {
    console.error("Revoke whitelist error:", error);
    return NextResponse.json(
      { error: "Failed to revoke whitelist status. " + (error.message || "") },
      { status: 500 }
    );
  }
}
