import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const auditors = await prisma.user.findMany({
      where: {
        role: { in: ["REGULATORY_AUDITOR", "STANDARD_AUDITOR", "CROSS_HUB_AUDITOR"] },
      },
      include: { organization: true, hub: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ auditors }, { status: 200 });
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
    const clearanceId = `AUD-${jurisdiction ? jurisdiction.toUpperCase() : "REG"}-${Math.floor(100 + Math.random() * 900)}`;

    // Find or create Regulatory Organization
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

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json(
        { error: `Auditor account for '${cleanEmail}' already exists in database.` },
        { status: 409 }
      );
    }

    // Create Statutory Auditor User
    const newUser = await prisma.user.create({
      data: {
        id: clearanceId,
        email: cleanEmail,
        displayName: displayName.trim(),
        role: role || "REGULATORY_AUDITOR",
        orgId: regOrg.id,
        status: "APPROVED",
        totpSecret: "JBSWY3DPEHPK3PXP", // Default TOTP seed
      },
      include: { organization: true },
    });

    // Also add to Whitelist as approved
    await prisma.whitelist.upsert({
      where: { email: cleanEmail },
      update: { status: "APPROVED", role: role || "REGULATORY_AUDITOR", orgId: regOrg.id },
      create: {
        email: cleanEmail,
        orgId: regOrg.id,
        role: role || "REGULATORY_AUDITOR",
        status: "APPROVED",
      },
    });

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
