import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hubId, displayName, orgName, region } = body;

    if (!hubId || !displayName) {
      return NextResponse.json(
        { error: "Hub ID and Display Name are required." },
        { status: 400 }
      );
    }

    const cleanHubId = hubId.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");

    // Check if Hub ID already exists
    const existingHub = await prisma.hub.findUnique({
      where: { id: cleanHubId },
    });

    if (existingHub) {
      return NextResponse.json(
        { error: `Hub with ID '${cleanHubId}' already exists.` },
        { status: 409 }
      );
    }

    // Find or create default Organization
    let org = await prisma.organization.findFirst({
      where: { displayName: orgName || "AnimusLab Enterprise Tenant" },
    });

    if (!org) {
      const orgId = `org-${Date.now()}`;
      const domain = `${cleanHubId}-${Date.now()}.animuslab.dev`;
      org = await prisma.organization.create({
        data: {
          id: orgId,
          displayName: orgName || "AnimusLab Enterprise Tenant",
          domain: domain,
          orgType: "ENTERPRISE",
          contractTier: "SOVEREIGN",
        },
      });
    }

    // Create the Hub
    const newHub = await prisma.hub.create({
      data: {
        id: cleanHubId,
        displayName: displayName.trim(),
        orgId: org.id,
        region: region || "us-east-1",
        apiKeyHash: `hash_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        isActive: true,
      },
      include: { organization: true },
    });

    return NextResponse.json({
      success: true,
      hub: newHub,
      message: `Hub node '${newHub.displayName}' (${newHub.id}) successfully provisioned and active on mesh.`,
    });
  } catch (error: any) {
    console.error("Hub provisioning error:", error);
    return NextResponse.json(
      { error: "Failed to provision Hub node. " + (error.message || "") },
      { status: 500 }
    );
  }
}
