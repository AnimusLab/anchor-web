import { prisma } from "@/lib/prisma";
import { FEATURE_CODES, FEATURE_METADATA, FeatureCode } from "./featureCodes";
import { Role, ModelStatus } from "@prisma/client";

export interface EntitlementCheckResult {
  allowed: boolean;
  featureCode: FeatureCode;
  type: "ADDITIVE" | "VALUE" | "BOOLEAN" | "REPLACEMENT";
  current: number;
  limit: number; // -1 represents unlimited
  reason?: string;
  scope: "ORGANIZATION" | "HUB";
}

export class EntitlementLimitExceededError extends Error {
  public featureCode: FeatureCode;
  public current: number;
  public limit: number;
  public upgradePath: string;

  constructor(details: {
    featureCode: FeatureCode;
    current: number;
    limit: number;
    upgradePath?: string;
  }) {
    super(
      `Entitlement limit exceeded for ${details.featureCode}: ${details.current}/${details.limit} consumed.`
    );
    this.name = "EntitlementLimitExceededError";
    this.featureCode = details.featureCode;
    this.current = details.current;
    this.limit = details.limit;
    this.upgradePath =
      details.upgradePath ||
      "Contact tan@animuslab.dev to expand your contractual capacity.";
  }
}

/**
 * Check whether an organization or hub is authorized to consume capacity
 * for a specific feature code under active commercial entitlement grants.
 */
export async function checkEntitlement(
  orgId: string,
  featureCode: FeatureCode,
  hubId?: string
): Promise<EntitlementCheckResult> {
  const now = new Date();
  const metadata = FEATURE_METADATA[featureCode];

  // 1. Fetch all ACTIVE grants for this feature in valid date range and matching scope
  const grants = await prisma.entitlementGrant.findMany({
    where: {
      orgId,
      featureCode,
      status: "ACTIVE",
      effectiveFrom: { lte: now },
      effectiveUntil: { gte: now },
      OR: [
        { scope: "ORGANIZATION" },
        hubId ? { scope: "HUB", hubId } : { scope: "ORGANIZATION" },
      ],
    },
    orderBy: { effectiveFrom: "desc" },
  });

  // If no grants exist, default behavior depends on feature type
  if (grants.length === 0) {
    return {
      allowed: false,
      featureCode,
      type: metadata.type,
      current: 0,
      limit: 0,
      reason: "NO_ACTIVE_ENTITLEMENT_GRANT",
      scope: hubId ? "HUB" : "ORGANIZATION",
    };
  }

  // Check for unlimited (-1) grant in any matching active grant
  const hasUnlimited = grants.some((g) => g.limitValue === -1);

  // 2. Evaluate based on EntitlementType
  if (metadata.type === "BOOLEAN") {
    const isEnabled = grants.some((g) => g.limitValue > 0);
    return {
      allowed: isEnabled,
      featureCode,
      type: "BOOLEAN",
      current: isEnabled ? 1 : 0,
      limit: 1,
      reason: isEnabled ? undefined : `${featureCode}_FEATURE_DISABLED`,
      scope: hubId ? "HUB" : "ORGANIZATION",
    };
  }

  if (metadata.type === "VALUE") {
    // Return the maximum granted value across active grants (e.g. DAC retention years)
    const maxValue = hasUnlimited
      ? -1
      : Math.max(...grants.map((g) => g.limitValue));
    return {
      allowed: true,
      featureCode,
      type: "VALUE",
      current: 0,
      limit: maxValue,
      scope: hubId ? "HUB" : "ORGANIZATION",
    };
  }

  // 3. ADDITIVE: Sum all valid active grant allocations
  const totalLimit = hasUnlimited
    ? -1
    : grants.reduce((sum, g) => sum + g.limitValue, 0);

  const currentUsage = await countCurrentUsage(orgId, featureCode, hubId);

  const allowed = totalLimit === -1 || currentUsage < totalLimit;

  return {
    allowed,
    featureCode,
    type: "ADDITIVE",
    current: currentUsage,
    limit: totalLimit,
    reason: allowed ? undefined : `${featureCode}_LIMIT_REACHED`,
    scope: hubId ? "HUB" : "ORGANIZATION",
  };
}

/**
 * Count active consumption of a capacity feature.
 */
export async function countCurrentUsage(
  orgId: string,
  featureCode: FeatureCode,
  hubId?: string
): Promise<number> {
  const F = FEATURE_CODES;

  switch (featureCode) {
    case F.GOVERNED_AI_MODEL_SLOTS:
      // PENDING, ACTIVE, and QUARANTINED all consume capacity
      // ARCHIVED and REJECTED do not
      return prisma.governedAiModel.count({
        where: {
          hub: { orgId },
          ...(hubId ? { hubId } : {}),
          status: {
            in: [ModelStatus.PENDING, ModelStatus.ACTIVE, ModelStatus.QUARANTINED],
          },
        },
      });

    case F.DEVELOPER_SEATS:
      return countSeatUsage(orgId, Role.DEVELOPER, hubId);

    case F.PROJECT_LEAD_SEATS:
      return countSeatUsage(orgId, Role.PROJECT_LEAD, hubId);

    case F.HUB_MANAGER_SEATS:
      return countSeatUsage(orgId, Role.HUB_MANAGER, hubId);

    case F.STANDARD_AUDITOR_SEATS:
      return countSeatUsage(orgId, Role.STANDARD_AUDITOR, hubId);

    case F.CROSS_HUB_AUDITOR_SEATS:
      // Cross-Hub Auditors have organization-wide scope
      return prisma.user.count({
        where: {
          orgId,
          role: Role.CROSS_HUB_AUDITOR,
          status: "APPROVED",
        },
      });

    case F.HUB_COUNT:
      return prisma.hub.count({
        where: {
          orgId,
          isActive: true,
        },
      });

    default:
      return 0;
  }
}

/**
 * Counts active approved users holding a clearance role in an organization or hub.
 */
async function countSeatUsage(
  orgId: string,
  role: Role,
  hubId?: string
): Promise<number> {
  return prisma.user.count({
    where: {
      orgId,
      role,
      status: "APPROVED",
      ...(hubId ? { hubId } : {}),
    },
  });
}

/**
 * Atomic registration for a Governed AI Model with PostgreSQL advisory locking.
 * Guarantees that concurrent requests cannot exceed the customer's contracted slot capacity.
 */
export async function registerAiModelAtomic(
  orgId: string,
  hubId: string,
  modelData: {
    name: string;
    slug: string;
    modelClass: string;
    riskCategory: string;
  }
) {
  return prisma.$transaction(async (tx) => {
    // 1. Compute 32-bit integer hash for advisory lock from orgId
    const lockKey = hashStringTo32BitInt(`model_reg:${orgId}`);
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockKey})`;

    const now = new Date();

    // 2. Sum active grants
    const grants = await tx.entitlementGrant.findMany({
      where: {
        orgId,
        featureCode: FEATURE_CODES.GOVERNED_AI_MODEL_SLOTS,
        status: "ACTIVE",
        effectiveFrom: { lte: now },
        effectiveUntil: { gte: now },
        OR: [
          { scope: "ORGANIZATION" },
          { scope: "HUB", hubId },
        ],
      },
    });

    const isUnlimited = grants.some((g) => g.limitValue === -1);
    const totalSlots = isUnlimited
      ? -1
      : grants.reduce((sum, g) => sum + g.limitValue, 0);

    // If no grants at all, cannot register
    if (grants.length === 0) {
      throw new EntitlementLimitExceededError({
        featureCode: FEATURE_CODES.GOVERNED_AI_MODEL_SLOTS,
        current: 0,
        limit: 0,
        upgradePath: "Activate an Anchor contract with Governed AI Model Slots.",
      });
    }

    // 3. Count consuming models within transaction
    const currentConsuming = await tx.governedAiModel.count({
      where: {
        hub: { orgId },
        status: {
          in: [ModelStatus.PENDING, ModelStatus.ACTIVE, ModelStatus.QUARANTINED],
        },
      },
    });

    // 4. Assert capacity invariant
    if (!isUnlimited && currentConsuming >= totalSlots) {
      throw new EntitlementLimitExceededError({
        featureCode: FEATURE_CODES.GOVERNED_AI_MODEL_SLOTS,
        current: currentConsuming,
        limit: totalSlots,
        upgradePath:
          "AI Governance Capacity Pack ($23,500/yr) or Model Slot ($2,500/yr)",
      });
    }

    // 5. Create the model
    return tx.governedAiModel.create({
      data: {
        hubId,
        name: modelData.name.trim(),
        slug: modelData.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""),
        modelClass: modelData.modelClass,
        riskCategory: modelData.riskCategory,
        status: ModelStatus.ACTIVE,
      },
    });
  });
}

/**
 * Returns a comprehensive entitlement and usage audit summary for a given organization/hub.
 */
export async function getEntitlementSummary(orgId: string, hubId?: string) {
  const codes = Object.values(FEATURE_CODES);
  const results: Record<string, EntitlementCheckResult> = {};

  for (const code of codes) {
    results[code] = await checkEntitlement(orgId, code, hubId);
  }

  return results;
}

/**
 * Stable 32-bit signed integer hash for pg_advisory_xact_lock.
 */
function hashStringTo32BitInt(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
