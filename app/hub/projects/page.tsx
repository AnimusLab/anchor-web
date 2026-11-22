import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { checkEntitlement } from "@/lib/entitlements/enforce";
import { FEATURE_CODES } from "@/lib/entitlements/featureCodes";
import ProjectManagerClient from "./ProjectManagerClient";

export const dynamic = "force-dynamic";

export default async function ProjectInventoryPage() {
  const session = await getSession();
  const hubId = session?.hubId || "animuslab-hq";

  let hubName = "Isolated Hub Silo";
  let orgId = "org-default";
  let projects: any[] = [];
  let models: any[] = [];
  let capacity: {
    consumedSlots: number;
    totalSlots: number;
    isUnlimited: boolean;
    remainingSlots: number | string;
  } = {
    consumedSlots: 0,
    totalSlots: 1,
    isUnlimited: false,
    remainingSlots: 1,
  };

  try {
    const hub = await prisma.hub.findUnique({
      where: { id: hubId },
      select: { orgId: true, displayName: true },
    });

    if (hub) {
      hubName = hub.displayName;
      orgId = hub.orgId;
    }

    // 1. Fetch Projects with bound models
    const projectsRaw = await prisma.project.findMany({
      where: { hubId },
      include: {
        modelBindings: {
          include: {
            model: {
              select: { id: true, name: true, slug: true, riskCategory: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    projects = projectsRaw.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      apiKeyHash: p.apiKeyHash,
      createdAt: p.createdAt.toISOString(),
      boundModels: p.modelBindings.map((b) => b.model),
    }));

    // 2. Fetch Governed AI Models with bound projects
    const modelsRaw = await prisma.governedAiModel.findMany({
      where: { hubId },
      include: {
        modelBindings: {
          include: {
            project: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    models = modelsRaw.map((m) => ({
      id: m.id,
      name: m.name,
      slug: m.slug,
      modelClass: m.modelClass,
      riskCategory: m.riskCategory,
      status: m.status,
      createdAt: m.createdAt.toISOString(),
      boundProjects: m.modelBindings.map((b) => b.project),
    }));

    // 3. Query dynamic entitlement capacity
    const capacityCheck = await checkEntitlement(
      orgId,
      FEATURE_CODES.GOVERNED_AI_MODEL_SLOTS,
      hubId
    );

    const isUnlimited = capacityCheck.limit === -1;
    capacity = {
      consumedSlots: capacityCheck.current,
      totalSlots: capacityCheck.limit,
      isUnlimited,
      remainingSlots: isUnlimited ? "UNLIMITED" : Math.max(0, capacityCheck.limit - capacityCheck.current),
    };
  } catch (e) {
    console.error("ProjectInventoryPage fetch error:", e);
  }

  return (
    <ProjectManagerClient
      initialProjects={projects}
      initialModels={models}
      capacity={capacity}
      hubId={hubId}
      hubName={hubName}
    />
  );
}
