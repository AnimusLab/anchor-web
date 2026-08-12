import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier } = body;

    if (!identifier || typeof identifier !== "string" || identifier.trim().length < 3) {
      return NextResponse.json({ found: false, message: "Invalid query identifier" }, { status: 400 });
    }

    const query = identifier.trim().toLowerCase();

    // 1. Search User table by email or ID
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: query, mode: "insensitive" } },
          { id: { equals: query, mode: "insensitive" } },
        ],
      },
      include: {
        organization: true,
        hub: true,
      },
    });

    if (user) {
      // Fetch public key fingerprint if registered
      const identity = await prisma.governanceIdentity.findFirst({
        where: { registeredBy: user.email },
      });

      return NextResponse.json({
        found: true,
        name: user.displayName || user.email.split("@")[0].toUpperCase(),
        email: user.email,
        orgName: user.organization?.displayName || "ANIMUSLAB MESH",
        hubId: user.hub?.id || user.hubId || "HUB_UNASSIGNED",
        clearanceId: user.id,
        role: user.role,
        fingerprint: identity?.publicKeyFingerprint
          ? `ED25519:${identity.publicKeyFingerprint.substring(0, 16)}...`
          : "ED25519: ACTIVE KEYPAIR PROVISIONED",
        statusText: "CRYPTOGRAPHIC IDENTITY MATCHED // READY FOR 2FA",
      });
    }

    // 2. Search GovernanceIdentity table by fingerprint or registeredBy
    const identity = await prisma.governanceIdentity.findFirst({
      where: {
        OR: [
          { publicKeyFingerprint: { equals: query, mode: "insensitive" } },
          { registeredBy: { equals: query, mode: "insensitive" } },
        ],
      },
    });

    if (identity) {
      return NextResponse.json({
        found: true,
        name: identity.projectName,
        email: identity.registeredBy || `${identity.projectName.toLowerCase()}@node.al`,
        orgName: "SOVEREIGN MESH NODE",
        hubId: identity.hubId,
        clearanceId: identity.id,
        role: "HYBRID_NODE_OPERATOR",
        fingerprint: `ED25519:${identity.publicKeyFingerprint.substring(0, 16)}...`,
        statusText: "NODE IDENTITY MATCHED // READY FOR 2FA",
      });
    }

    // 3. Search AdminUser table
    const admin = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { email: { equals: query, mode: "insensitive" } },
          { id: { equals: query, mode: "insensitive" } },
        ],
      },
    });

    if (admin) {
      return NextResponse.json({
        found: true,
        name: admin.displayName || "ROOT OPERATOR",
        email: admin.email,
        orgName: "ANIMUSLAB INFRASTRUCTURE",
        hubId: "SOVEREIGN_ROOT",
        clearanceId: admin.id,
        role: admin.role,
        fingerprint: "ED25519: ROOT HARDWARE KEY SIGNED",
        statusText: "ROOT OPERATOR CLEARANCE VERIFIED",
      });
    }

    return NextResponse.json({ found: false, message: "No identity found for given identifier" });
  } catch (error: any) {
    console.error("Identity lookup failed:", error);
    return NextResponse.json({ found: false, error: "Server lookup error" }, { status: 500 });
  }
}
