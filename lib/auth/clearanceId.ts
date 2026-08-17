import { Role } from "./clearance";

/**
 * Mapping of Roles to standard Role Code and Clearance Level Tag.
 */
export const ROLE_LEVEL_MAP: Record<Role | string, { code: string; level: string }> = {
  ANIMUS_ADMIN: { code: "ADM", level: "L5" },
  HUB_MANAGER: { code: "MGR", level: "L3" },
  PROJECT_LEAD: { code: "PJ", level: "L2" },
  DEVELOPER: { code: "DEV", level: "L1" },
  STANDARD_AUDITOR: { code: "SA", level: "L1" },
  CROSS_HUB_AUDITOR: { code: "CH", level: "L4" },
  REGULATORY_AUDITOR: { code: "RA", level: "L4" },
};

/**
 * Generates a standardized Clearance ID in the format: [NAME]-[ROLE]-[LEVEL]
 * Example: Tanishq + HUB_MANAGER -> TAN-MGR-L3
 * 
 * @param name User's full name or display name (e.g., "Tanishq", "Sam")
 * @param role User's assigned Role (e.g., "HUB_MANAGER", "REGULATORY_AUDITOR")
 * @param sequence Optional sequence number for duplicates (e.g., 2 -> TAN-MGR-L3-2)
 */
export function generateClearanceId(name: string, role: Role | string, sequence?: number): string {
  // Extract 3-letter name prefix (e.g. "Tanishq" -> "TAN")
  const cleanName = (name || "USR")
    .trim()
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();
  const namePrefix = cleanName.slice(0, 3).padEnd(3, "X");

  // Lookup Role Code & Level Tag
  const meta = ROLE_LEVEL_MAP[role] || { code: "USR", level: "L1" };

  const baseId = `${namePrefix}-${meta.code}-${meta.level}`;
  return sequence && sequence > 1 ? `${baseId}-${sequence}` : baseId;
}
