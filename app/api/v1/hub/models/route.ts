import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import {
  checkEntitlement,
  registerAiModelAtomic,
  EntitlementLimitExceededError,
} from "@/lib/entitlements/enforce";
import { FEATURE_CODES } from "@/lib/entitlements/featureCodes";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hubId = session.hubId || "animuslab-hq";

    // Retrieve Hub's Organization
    const hub = await prisma.hub.findUnique({
      where: { id: hubId },
      select: { orgId: true, displayName: true },
    });

    if (!hub) {
      return NextResponse.json({ error: "Hub not found" }, { status: 404 });
    }

    // Capacity assessment
    const capacity = await checkEntitlement(
      hub.orgId,
      FEATURE_CODES.GOVERNED_AI_MODEL_SLOTS,
      hubId
    );

    // List models
    const models = await prisma.governedAiModel.findMany({
      where: { hubId },
      include: {
        modelBindings: {
          include: {
            project: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        _count: {
          select: {
            telemetryEvents: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      hubId,
      hubName: hub.displayName,
      capacity: {
        consumedSlots: capacity.current,
        totalSlots: capacity.limit,
        isUnlimited: capacity.limit === -1,
        remainingSlots:
          capacity.limit === -1 ? "UNLIMITED" : Math.max(0, capacity.limit - capacity.current),
        status: capacity.allowed ? "WITHIN_QUOTA" : "QUOTA_EXCEEDED",
      },
      models: models.map((m) => ({
        id: m.id,
        name: m.name,
        slug: m.slug,
        modelClass: m.modelClass,
        riskCategory: m.riskCategory,
        status: m.status,
        consumesSlot: ["PENDING", "ACTIVE", "QUARANTINED"].includes(m.status),
        createdAt: m.createdAt,
        boundProjects: m.modelBindings.map((b) => b.project),
        telemetryEventsCount: m._count.telemetryEvents,
      })),
    });
  } catch (error: any) {
    console.error("GET /api/v1/hub/models error:", error);
    return NextResponse.json(
      { error: "Failed to fetch governed AI models." },
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
        { error: "Access Denied: Only Hub Managers and Project Leads can register governed AI models." },
        { status: 403 }
      );
    }

    const hubId = session.hubId || "animuslab-hq";
    const hub = await prisma.hub.findUnique({
      where: { id: hubId },
      select: { orgId: true, displayName: true },
    });

    if (!hub) {
      return NextResponse.json({ error: "Hub not found." }, { status: 404 });
    }

    const body = await req.json();
    const { name, slug, modelClass = "PROPRIETARY", riskCategory = "HIGH_RISK" } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Model name is required (e.g. 'Credit-Scoring-Agent')." },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanSlug = (slug || cleanName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Check slug collision
    const existing = await prisma.governedAiModel.findUnique({
      where: {
        hubId_slug: {
          hubId,
          slug: cleanSlug,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `An AI model with slug '${cleanSlug}' is already registered in this Hub.` },
        { status: 409 }
      );
    }

    // Atomic registration with PostgreSQL advisory lock on the Org
    const model = await registerAiModelAtomic(hub.orgId, hubId, {
      name: cleanName,
      slug: cleanSlug,
      modelClass,
      riskCategory,
    });

    return NextResponse.json({
      success: true,
      model: {
        id: model.id,
        name: model.name,
        slug: model.slug,
        modelClass: model.modelClass,
        riskCategory: model.riskCategory,
        status: model.status,
        createdAt: model.createdAt,
      },
      message: `Governed AI Model '${model.name}' registered successfully. 1 Governed AI Model Slot consumed.`,
    });
  } catch (error: any) {
    if (error instanceof EntitlementLimitExceededError) {
      return NextResponse.json(
        {
          error: "GOVERNED_AI_MODEL_SLOT_LIMIT_REACHED",
          message: error.message,
          current: error.current,
          limit: error.limit,
          upgradePath: error.upgradePath,
        },
        { status: 403 }
      );
    }

    console.error("POST /api/v1/hub/models error:", error);
    return NextResponse.json(
      { error: "Failed to register AI model. " + (error.message || "") },
      { status: 500 }
    );
  }
}
