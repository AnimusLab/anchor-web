import { Role } from "./clearance";
import { prisma } from "@/lib/prisma";

/**
 * Mapping of Roles to standard Role Code and Clearance Level Tag.
 */
export const ROLE_LEVEL_MAP: Record<Role | string, { code: string; level: string }> = {
  ANIMUS_ADMIN: { code: "ADM", level: "L5" },
  HUB_MANAGER: { code: "MGR", level: "L3" },
  PROJECT_LEAD: { code: "PJ", level: "L2" },
  DEVELOPER: { code: "DEV", level: "L1" },
  STANDARD_AUDITOR: { code: "SA", level: "L1" },
  CROSS_HUB_AUDITOR: { code: "CH", level: "L2" },
  REGULATORY_AUDITOR: { code: "RA", level: "L4" },
};

/**
 * Extracts a clean 3-4 character uppercase organization/jurisdiction tag.
 * e.g. "RBI" -> "RBI", "SEC" -> "SEC", "Reserve Bank of India" -> "RBI", "rbi-org-in" -> "RBI"
 */
export function extractOrgTag(orgNameOrJurisdiction?: string | null): string {
  if (!orgNameOrJurisdiction) return "REG";
  const str = orgNameOrJurisdiction.trim();

  // Known special regulatory abbreviations
  const upper = str.toUpperCase();
  if (upper.includes("RBI") || upper.includes("RESERVE BANK")) return "RBI";
  if (upper.includes("SEC") || upper.includes("SECURITIES AND EXCHANGE")) return "SEC";
  if (upper.includes("SEBI")) return "SEBI";
  if (upper.includes("FCA")) return "FCA";
  if (upper.includes("CFPB")) return "CFPB";
  if (upper.includes("MAS") || upper.includes("SINGAPORE")) return "MAS";
  if (upper.includes("FINMA") || upper.includes("SWISS")) return "FINMA";
  if (upper.includes("EU") || upper.includes("EUROPEAN")) return "EU";
  if (upper.includes("FED") || upper.includes("FEDERAL RESERVE")) return "FED";
  if (upper.includes("PRA")) return "PRA";
  if (upper.includes("HKMA")) return "HKMA";
  if (upper.includes("ASIC")) return "ASIC";

  // If already a short alphanumeric code (e.g. "RBI", "NYDFS", "GL")
  const clean = str.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (clean.length >= 2 && clean.length <= 5) {
    return clean;
  }

  // Otherwise pick first letters of words
  const words = str.split(/[\s-_.]+/).filter(Boolean);
  if (words.length >= 2 && words.length <= 4) {
    return words.map(w => w[0].toUpperCase()).join("");
  }

  return clean.slice(0, 4) || "REG";
}

/**
 * Generates a standardized Clearance ID in the format: [NAME]-[ROLE]-[LEVEL]
 * Example: Tanishq + HUB_MANAGER -> TAN-MGR-L3
 */
export function generateClearanceId(name: string, role: Role | string, sequence?: number): string {
  // Extract 3-letter name prefix (e.g. "Tanishq" -> "TAN")
  const cleanName = (name || "USR")
    .trim()
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();
  const namePrefix = cleanName.slice(0, 3).padEnd(3, "X");

  // Lookup Role Code & Level Tag
  const meta = ROLE_LEVEL_MAP[role] || { code: "DEV", level: "L1" };

  const baseId = `${namePrefix}-${meta.code}-${meta.level}`;
  return sequence && sequence > 1 ? `${baseId}-${sequence}` : baseId;
}

/**
 * Generates an organization-based sequential clearance ID.
 * Example for Regulatory Auditor in RBI: AUD-RBI-L4-001, AUD-RBI-L4-002, etc.
 * Example for Cross-Hub Auditor: AUD-CH-L2-001, AUD-CH-L2-002
 * Example for Standard Auditor: AUD-SA-L1-001, AUD-SA-L1-002
 * Example for Enterprise User: TAN-MGR-L3 (or TAN-MGR-L3-2 if duplicate)
 */
export async function generateSequentialClearanceId({
  name,
  role,
  orgName,
  orgId,
  jurisdiction,
  region,
}: {
  name?: string;
  role: Role | string;
  orgName?: string | null;
  orgId?: string | null;
  jurisdiction?: string | null;
  region?: string | null;
}): Promise<string> {
  const isRegulatory = role === "REGULATORY_AUDITOR";
  const isCrossHub = role === "CROSS_HUB_AUDITOR";
  const isStandardAuditor = role === "STANDARD_AUDITOR";

  if (isRegulatory || isCrossHub || isStandardAuditor) {
    let prefix = "";
    if (isRegulatory) {
      const orgTag = extractOrgTag(jurisdiction || orgName || region || orgId || "REG");
      prefix = `AUD-${orgTag}-L4-`;
    } else if (isCrossHub) {
      const orgTag = jurisdiction || region ? extractOrgTag(jurisdiction || region) : "CH";
      prefix = `AUD-${orgTag}-L2-`;
    } else {
      const orgTag = orgName || jurisdiction ? extractOrgTag(orgName || jurisdiction) : "SA";
      prefix = `AUD-${orgTag}-L1-`;
    }

    // Query all existing user IDs and whitelist previewClearanceIds with this prefix
    const [existingUsers, existingWhitelists] = await Promise.all([
      prisma.user.findMany({
        where: { id: { startsWith: prefix } },
        select: { id: true },
      }),
      prisma.whitelist.findMany({
        where: { previewClearanceId: { startsWith: prefix } },
        select: { previewClearanceId: true },
      }),
    ]);

    const allIds = Array.from(new Set([
      ...existingUsers.map(u => u.id),
      ...existingWhitelists.map(w => w.previewClearanceId).filter(Boolean) as string[],
    ]));

    let maxSeq = 0;
    for (const id of allIds) {
      const suffix = id.replace(prefix, "");
      const num = parseInt(suffix, 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }

    // If maxSeq >= 100 (which was legacy random 3-digit number) and total count is small,
    // determine next clean sequence based on total member count + 1
    let nextSeq = maxSeq + 1;
    if (maxSeq >= 100 && allIds.length < 50) {
      nextSeq = allIds.length + 1;
    }

    return `${prefix}${String(nextSeq).padStart(3, "0")}`;
  }

  // For Enterprise Users (e.g. HUB_MANAGER, PROJECT_LEAD, DEVELOPER)
  const cleanName = (name || "USR")
    .trim()
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();
  const namePrefix = cleanName.slice(0, 3).padEnd(3, "X");
  const meta = ROLE_LEVEL_MAP[role] || { code: "DEV", level: "L1" };
  const baseId = `${namePrefix}-${meta.code}-${meta.level}`;

  // Check if baseId already taken
  const existing = await prisma.user.findUnique({ where: { id: baseId } });
  if (!existing) {
    return baseId;
  }

  // If already exists, find next sequential suffix (e.g. -2, -3)
  let seq = 2;
  while (await prisma.user.findUnique({ where: { id: `${baseId}-${seq}` } })) {
    seq++;
  }
  return `${baseId}-${seq}`;
}
