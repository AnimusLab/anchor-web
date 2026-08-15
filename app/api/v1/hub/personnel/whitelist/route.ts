import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCredentialWelcomeEmail } from "@/lib/email";

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

    // 2. Generate Unique Clearance ID (e.g. CLR-CITI-9412)
    const hubSlug = hubId.split("-")[0].toUpperCase();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const clearanceId = `CLR-${hubSlug}-${randomCode}`;

    // 3. Upsert User in database
    const user = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        displayName: cleanName,
        role: targetRole as any,
        orgId: hub.orgId,
        hubId: hub.id,
        status: "APPROVED",
      },
      create: {
        id: clearanceId,
        email: cleanEmail,
        displayName: cleanName,
        role: targetRole as any,
        orgId: hub.orgId,
        hubId: hub.id,
        status: "APPROVED",
        totpSecret: "JBSWY3DPEHPK3PXP", // Standard default TOTP seed
      },
      include: { organization: true, hub: true },
    });

    // 4. Upsert Whitelist entry
    await prisma.whitelist.upsert({
      where: { email: cleanEmail },
      update: {
        status: "APPROVED",
        role: targetRole as any,
        orgId: hub.orgId,
        hubId: hub.id,
      },
      create: {
        email: cleanEmail,
        orgId: hub.orgId,
        hubId: hub.id,
        role: targetRole as any,
        status: "APPROVED",
      },
    });

    // 5. Send Welcome Email via Resend
    sendCredentialWelcomeEmail({
      to: cleanEmail,
      name: cleanName,
      clearanceId: user.id,
      hubId: hub.id,
      role: targetRole,
      totpSecret: user.totpSecret || "JBSWY3DPEHPK3PXP",
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
