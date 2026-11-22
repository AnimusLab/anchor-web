import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hubId = session.hubId || "animuslab-hq";

    const projects = await prisma.project.findMany({
      where: { hubId },
      include: {
        modelBindings: {
          include: {
            model: {
              select: {
                id: true,
                name: true,
                slug: true,
                riskCategory: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            users: true,
            apiKeys: true,
            scanEvents: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      hubId,
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        apiKeyPrefix: p.apiKeyHash ? p.apiKeyHash.slice(0, 10) + "…" : null,
        createdAt: p.createdAt,
        boundModels: p.modelBindings.map((b) => b.model),
        stats: {
          usersCount: p._count.users,
          keysCount: p._count.apiKeys,
          scanEventsCount: p._count.scanEvents,
        },
      })),
      entitlementNote: "Project registration is unrestricted. Unlimited codebases permitted.",
    });
  } catch (error: any) {
    console.error("GET /api/v1/hub/projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAuthorized =
      session.role === "HUB_MANAGER" ||
      session.role === "PROJECT_LEAD" ||
      session.role === "ANIMUS_ADMIN";

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Access Denied: Only Hub Managers and Project Leads can provision project silos." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, slug } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Project name is required." },
        { status: 400 }
      );
    }

    const hubId = session.hubId || "animuslab-hq";
    const cleanName = name.trim();
    const cleanSlug = (slug || cleanName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!cleanSlug) {
      return NextResponse.json(
        { error: "A valid slug could not be generated." },
        { status: 400 }
      );
    }

    // Check if slug is already taken within this hub
    const existing = await prisma.project.findUnique({
      where: {
        hubId_slug: {
          hubId,
          slug: cleanSlug,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A project with slug '${cleanSlug}' already exists in this Hub.` },
        { status: 409 }
      );
    }

    // Generate project API key
    const rawKey = `anc_proj_${crypto.randomBytes(24).toString("hex")}`;
    const keyPrefix = rawKey.slice(0, 16);
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    // Invariant: Unrestricted project creation. No slot checks.
    const project = await prisma.project.create({
      data: {
        hubId,
        name: cleanName,
        slug: cleanSlug,
        apiKeyHash: keyHash,
        apiKeys: {
          create: {
            name: `${cleanName} Primary Integration Key`,
            keyPrefix,
            keyHash,
            hubId,
            role: "DEVELOPER",
            scope: "FULL_ACCESS",
            createdBy: session.id,
          },
        },
      },
      include: {
        hub: {
          select: { displayName: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        slug: project.slug,
        hubId: project.hubId,
        hubName: project.hub.displayName,
        createdAt: project.createdAt,
      },
      apiKey: rawKey, // Rendered once to user for config
      message: `Project silo '${cleanName}' provisioned successfully. Anchor static analysis is unrestricted.`,
    });
  } catch (error: any) {
    console.error("POST /api/v1/hub/projects error:", error);
    return NextResponse.json(
      { error: "Failed to provision project. " + (error.message || "") },
      { status: 500 }
    );
  }
}
