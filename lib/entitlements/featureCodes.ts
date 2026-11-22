/**
 * ANCHOR COMMERCIAL ENTITLEMENT ENGINE — FEATURE CODES & METRICS
 * Specification Revision 2.1 (Frozen)
 *
 * Invariant: Project registration is completely UNRESTRICTED.
 * Codebase static scanning carries zero numerical slot ceiling.
 * Runtime AI governance is capacity-metered via GOVERNED_AI_MODEL_SLOTS.
 */

export const FEATURE_CODES = {
  // Runtime AI Governance Capacity (The only AI system capacity metric)
  GOVERNED_AI_MODEL_SLOTS: "GOVERNED_AI_MODEL_SLOTS",

  // Clearance Seats (Active clearance assignments within scope)
  HUB_MANAGER_SEATS:       "HUB_MANAGER_SEATS",
  PROJECT_LEAD_SEATS:      "PROJECT_LEAD_SEATS",
  DEVELOPER_SEATS:         "DEVELOPER_SEATS",
  STANDARD_AUDITOR_SEATS:  "STANDARD_AUDITOR_SEATS",
  CROSS_HUB_AUDITOR_SEATS: "CROSS_HUB_AUDITOR_SEATS",

  // Infrastructure & Retention
  HUB_COUNT:               "HUB_COUNT",
  DAC_RETENTION_YEARS:     "DAC_RETENTION_YEARS",
  SOVEREIGN_DEPLOYMENT:    "SOVEREIGN_DEPLOYMENT",
} as const;

export type FeatureCode = typeof FEATURE_CODES[keyof typeof FEATURE_CODES];

export type EntitlementType = "ADDITIVE" | "REPLACEMENT" | "VALUE" | "BOOLEAN";

export interface FeatureMetadata {
  code: FeatureCode;
  label: string;
  type: EntitlementType;
  description: string;
}

export const FEATURE_METADATA: Record<FeatureCode, FeatureMetadata> = {
  [FEATURE_CODES.GOVERNED_AI_MODEL_SLOTS]: {
    code: FEATURE_CODES.GOVERNED_AI_MODEL_SLOTS,
    label: "Governed AI Model Slots",
    type: "ADDITIVE",
    description: "Distinct production AI systems governed through runtime decision interception.",
  },
  [FEATURE_CODES.HUB_MANAGER_SEATS]: {
    code: FEATURE_CODES.HUB_MANAGER_SEATS,
    label: "Hub Manager Clearances (L3)",
    type: "ADDITIVE",
    description: "Apex administrators with dual-key cryptographic approval sovereignty.",
  },
  [FEATURE_CODES.PROJECT_LEAD_SEATS]: {
    code: FEATURE_CODES.PROJECT_LEAD_SEATS,
    label: "Project Lead Clearances (L2)",
    type: "ADDITIVE",
    description: "Project management, API key rotation, and telemetry monitoring.",
  },
  [FEATURE_CODES.DEVELOPER_SEATS]: {
    code: FEATURE_CODES.DEVELOPER_SEATS,
    label: "Developer Clearances (L1)",
    type: "ADDITIVE",
    description: "CLI AST scanning, pre-commit gates, and @anchor.guard instrumentation.",
  },
  [FEATURE_CODES.STANDARD_AUDITOR_SEATS]: {
    code: FEATURE_CODES.STANDARD_AUDITOR_SEATS,
    label: "Standard Auditor Clearances (L1)",
    type: "ADDITIVE",
    description: "Single-hub DAC forensic review and Enforcement Notice filing.",
  },
  [FEATURE_CODES.CROSS_HUB_AUDITOR_SEATS]: {
    code: FEATURE_CODES.CROSS_HUB_AUDITOR_SEATS,
    label: "Cross-Hub Auditor Clearances (L2)",
    type: "ADDITIVE",
    description: "Multi-hub global explorer and enterprise-wide risk aggregation.",
  },
  [FEATURE_CODES.HUB_COUNT]: {
    code: FEATURE_CODES.HUB_COUNT,
    label: "Hub Containers",
    type: "ADDITIVE",
    description: "Isolated organizational branch infrastructure nodes.",
  },
  [FEATURE_CODES.DAC_RETENTION_YEARS]: {
    code: FEATURE_CODES.DAC_RETENTION_YEARS,
    label: "DAC Retention Period",
    type: "VALUE",
    description: "Immutable Decision Audit Chain retention duration in years.",
  },
  [FEATURE_CODES.SOVEREIGN_DEPLOYMENT]: {
    code: FEATURE_CODES.SOVEREIGN_DEPLOYMENT,
    label: "Sovereign Air-Gapped Mode",
    type: "BOOLEAN",
    description: "Fully air-gapped on-premises deployment with zero external network socket.",
  },
};

/**
 * Base starting configurations for reference packages.
 * Adjustments and add-ons are aggregated additively on top.
 */
export const PACKAGE_DEFAULTS: Record<string, Partial<Record<FeatureCode, number>>> = {
  LAUNCH: {
    [FEATURE_CODES.HUB_COUNT]: 1,
    [FEATURE_CODES.GOVERNED_AI_MODEL_SLOTS]: 1,
    [FEATURE_CODES.HUB_MANAGER_SEATS]: 1,
    [FEATURE_CODES.PROJECT_LEAD_SEATS]: 1,
    [FEATURE_CODES.DEVELOPER_SEATS]: 5,
    [FEATURE_CODES.STANDARD_AUDITOR_SEATS]: 1,
    [FEATURE_CODES.CROSS_HUB_AUDITOR_SEATS]: 0,
    [FEATURE_CODES.DAC_RETENTION_YEARS]: 2,
    [FEATURE_CODES.SOVEREIGN_DEPLOYMENT]: 0,
  },
  STARTER: {
    [FEATURE_CODES.HUB_COUNT]: 1,
    [FEATURE_CODES.GOVERNED_AI_MODEL_SLOTS]: 2,
    [FEATURE_CODES.HUB_MANAGER_SEATS]: 1,
    [FEATURE_CODES.PROJECT_LEAD_SEATS]: 2,
    [FEATURE_CODES.DEVELOPER_SEATS]: 25,
    [FEATURE_CODES.STANDARD_AUDITOR_SEATS]: 2,
    [FEATURE_CODES.CROSS_HUB_AUDITOR_SEATS]: 0,
    [FEATURE_CODES.DAC_RETENTION_YEARS]: 3,
    [FEATURE_CODES.SOVEREIGN_DEPLOYMENT]: 0,
  },
  PROFESSIONAL: {
    [FEATURE_CODES.HUB_COUNT]: 1,
    [FEATURE_CODES.GOVERNED_AI_MODEL_SLOTS]: 4,
    [FEATURE_CODES.HUB_MANAGER_SEATS]: 1,
    [FEATURE_CODES.PROJECT_LEAD_SEATS]: 4,
    [FEATURE_CODES.DEVELOPER_SEATS]: 40,
    [FEATURE_CODES.STANDARD_AUDITOR_SEATS]: 4,
    [FEATURE_CODES.CROSS_HUB_AUDITOR_SEATS]: 0,
    [FEATURE_CODES.DAC_RETENTION_YEARS]: 4,
    [FEATURE_CODES.SOVEREIGN_DEPLOYMENT]: 0,
  },
  SOVEREIGN: {
    [FEATURE_CODES.HUB_COUNT]: -1, // Unlimited
    [FEATURE_CODES.GOVERNED_AI_MODEL_SLOTS]: -1, // Unlimited
    [FEATURE_CODES.HUB_MANAGER_SEATS]: -1,
    [FEATURE_CODES.PROJECT_LEAD_SEATS]: -1,
    [FEATURE_CODES.DEVELOPER_SEATS]: -1,
    [FEATURE_CODES.STANDARD_AUDITOR_SEATS]: -1,
    [FEATURE_CODES.CROSS_HUB_AUDITOR_SEATS]: -1,
    [FEATURE_CODES.DAC_RETENTION_YEARS]: 7,
    [FEATURE_CODES.SOVEREIGN_DEPLOYMENT]: 1,
  },
};
