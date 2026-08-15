import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, domain, city } = body;

    if (!companyName || !domain) {
      return NextResponse.json(
        { error: "Company Name and Work Email Domain are required." },
        { status: 400 }
      );
    }

    const cleanCompany = companyName.trim();
    const cleanDomain = domain.trim().toLowerCase().replace(/^@/, "");
    const cleanCity = (city || fontDefaultCity(cleanCompany)).trim().toLowerCase().replace(/[^a-z0-9-]/g, "");

    // 1. Slugify Company Prefix (e.g., "Citigroup" -> "citi")
    const companySlug = cleanCompany
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .substring(0, 8);

    // 2. Generate Base Hub ID Prefix (e.g., "citi-london")
    const baseHubId = cleanCity ? `${companySlug}-${cleanCity}` : companySlug;

    // 3. Find unique Hub ID with auto-increment counter (e.g., citi-london-01)
    let candidateHubId = `${baseHubId}-01`;
    let counter = 1;

    while (await prisma.hub.findUnique({ where: { id: candidateHubId } })) {
      counter++;
      const suffix = counter < 10 ? `0${counter}` : `${counter}`;
      candidateHubId = `${baseHubId}-${suffix}`;
    }

    const hubId = candidateHubId;
    const displayName = `${cleanCompany} — ${(city || "HQ").toUpperCase()} Silo`;

    // 4. Find or Create Organization by domain
    let org = await prisma.organization.findUnique({
      where: { domain: cleanDomain },
    });

    if (!org) {
      const orgId = `org-${companySlug}-${Date.now()}`;
      org = await prisma.organization.create({
        data: {
          id: orgId,
          displayName: cleanCompany,
          domain: cleanDomain,
          orgType: "ENTERPRISE",
          contractTier: "SOVEREIGN",
        },
      });
    }

    // 5. Create Hub Node (Cloud Region is initially "UNCONFIGURED_PENDING_MANAGER")
    const newHub = await prisma.hub.create({
      data: {
        id: hubId,
        displayName: displayName,
        orgId: org.id,
        region: "UNCONFIGURED (Pending Manager Setup)",
        apiKeyHash: `hash_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        isActive: true,
      },
      include: { organization: true },
    });

    return NextResponse.json({
      success: true,
      hub: newHub,
      hubId: newHub.id,
      displayName: newHub.displayName,
      domain: org.domain,
      inviteLink: `https://hub.animuslab.dev/login?hubId=${newHub.id}`,
      message: `Sovereign Hub '${newHub.displayName}' (${newHub.id}) auto-generated and active.`,
    });
  } catch (error: any) {
    console.error("Auto Hub Provisioning error:", error);
    return NextResponse.json(
      { error: "Failed to auto-provision Hub node. " + (error.message || "") },
      { status: 500 }
    );
  }
}

function fontDefaultCity(company: string): string {
  return "hq";
}
