import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function performLookup(identifier: string) {
  const query = identifier.trim().toLowerCase();

  try {
    // 1. Check AdminUser Table (Root Platform Admins)
    const admin = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { email: { equals: query, mode: "insensitive" } },
          { id: { equals: query, mode: "insensitive" } },
        ],
      },
    });

    if (admin) {
      const identity = await prisma.governanceIdentity.findFirst({
        where: { registeredBy: admin.email },
      });

      return {
        found: true,
        name: admin.displayName || "Root Admin",
        email: admin.email,
        orgName: "AnimusLab Sovereign Infrastructure",
        hubId: "animuslab-hq",
        clearanceId: admin.id,
        role: admin.role,
        fingerprint: identity?.publicKeyFingerprint
          ? `ED25519:${identity.publicKeyFingerprint.substring(0, 16)}`
          : "ED25519:8f92a11b8ca4549f2b828fc0e80112a",
        avatarUrl: "/avatars/memoji_smiling.jpg",
        statusText: "ROOT PLATFORM ADMIN VERIFIED // LEVEL 1 AUTHORITY",
      };
    }

    // 2. Check User Table (Enterprise & Regulatory Auditor Users)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: query, mode: "insensitive" } },
          { id: { equals: query, mode: "insensitive" } },
        ],
      },
      include: { organization: true, hub: true },
    });

    if (user) {
      const identity = await prisma.governanceIdentity.findFirst({
        where: { registeredBy: user.email },
      });

      return {
        found: true,
        name: user.displayName || user.email.split("@")[0].toUpperCase(),
        email: user.email,
        orgName: user.organization?.displayName || "ANIMUSLAB GOVERNANCE MESH",
        hubId: user.hub?.id || user.hubId || "animuslab-hq",
        clearanceId: user.id,
        role: user.role,
        fingerprint: identity?.publicKeyFingerprint
          ? `ED25519:${identity.publicKeyFingerprint.substring(0, 16)}`
          : "ED25519: ACTIVE KEYPAIR PROVISIONED",
        avatarUrl: (user as any).avatarUrl || "/avatars/memoji_smiling.jpg",
        statusText: "CRYPTOGRAPHIC IDENTITY MATCHED // READY FOR AUTH",
      };
    }

    // 3. Check Whitelist Table
    const whitelisted = await prisma.whitelist.findFirst({
      where: {
        email: { equals: query, mode: "insensitive" },
      },
      include: { organization: true, hub: true },
    });

    if (whitelisted) {
      return {
        found: true,
        name: whitelisted.email.split("@")[0].toUpperCase(),
        email: whitelisted.email,
        orgName: whitelisted.organization?.displayName || "ANIMUSLAB MESH",
        hubId: whitelisted.hub?.id || whitelisted.hubId || "animuslab-hq",
        clearanceId: whitelisted.id,
        role: whitelisted.role,
        fingerprint: "ED25519: WHITELISTED KEYPAIR",
        avatarUrl: "/avatars/memoji_smiling.jpg",
        statusText: "SOVEREIGN WHITELIST MATCHED // READY FOR PROVISIONING",
      };
    }
  } catch (err) {
    console.error("Lookup database error:", err);
  }

  return { found: false, message: "No identity record found in Sovereign Database" };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clearanceId = searchParams.get("clearanceId") || searchParams.get("identifier");

  if (!clearanceId || clearanceId.trim().length < 3) {
    return NextResponse.json({ found: false, message: "Invalid clearanceId" }, { status: 400 });
  }

  const result = await performLookup(clearanceId);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = body.clearanceId || body.identifier;

    if (!identifier || typeof identifier !== "string" || identifier.trim().length < 3) {
      return NextResponse.json({ found: false, message: "Invalid identifier" }, { status: 400 });
    }

    const result = await performLookup(identifier);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ found: false, error: "Lookup error" }, { status: 500 });
  }
}
