import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import ApiKeyVaultClient, { ApiKeyItem, ProjectOption } from "./ApiKeyVaultClient";

export const dynamic = "force-dynamic";

export default async function ApiKeyVaultPage() {
  const session = await getSession();
  const hubId = session?.hubId || "animuslab-hq";
  const role = session?.role || "DEVELOPER";

  const isManager = role === "HUB_MANAGER" || role === "ANIMUS_ADMIN";
  const isLeadOrManager = isManager || role === "PROJECT_LEAD";

  let keysList: ApiKeyItem[] = [];
  let projectsList: ProjectOption[] = [];

  try {
    const [dbKeys, dbProjects] = await Promise.all([
      prisma.apiKey.findMany({
        where: {
          hubId,
          ...(session?.projectId && !isManager ? { projectId: session.projectId } : {}),
        },
        include: {
          project: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.findMany({
        where: {
          hubId,
          ...(session?.projectId && !isManager ? { id: session.projectId } : {}),
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    keysList = dbKeys.map((k) => ({
      id: k.id,
      name: k.name,
      keyPrefix: k.keyPrefix,
      scope: k.scope,
      role: k.role,
      projectId: k.projectId,
      projectName: k.project?.name || "Global Hub",
      createdAt: k.createdAt,
      expiresAt: k.expiresAt,
      isActive: k.isActive,
    }));

    projectsList = dbProjects;
  } catch (err) {
    console.error("Key vault fetch error:", err);
  }

  return (
    <ApiKeyVaultClient
      initialKeys={keysList}
      projects={projectsList}
      userRole={role}
      hubId={hubId}
      isLeadOrManager={isLeadOrManager}
      isManager={isManager}
    />
  );
}
