import { PrismaClient, OrgType, ContractTier, Role, AdminRole, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

const TOTP_SECRET = "JBSWY3DPEHPK3PXP"; // Standard static testing secret (also supports static TOTP code 123456)

async function main() {
  console.log("🌱 Starting clean provision of the 7 foundational roles across Enterprise, Auditory, and Admin systems...");

  // 1. Clean existing seed data if any
  console.log("🧹 Clearing prior seed entities...");
  await prisma.auditorTrail.deleteMany({});
  await prisma.auditTrail.deleteMany({});
  await prisma.adminAuditLog.deleteMany({});
  await prisma.enforcementNotice.deleteMany({});
  await prisma.governanceAccessRequest.deleteMany({});
  await prisma.governanceIdentity.deleteMany({});
  await prisma.userHubAssignment.deleteMany({});
  await prisma.apiKey.deleteMany({});
  await prisma.whitelist.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.adminUser.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.hub.deleteMany({});
  await prisma.organization.deleteMany({});

  // 2. Provision Organizations
  console.log("🏢 Provisioning Organizations...");
  const animusOrg = await prisma.organization.create({
    data: {
      id: "animuslab",
      displayName: "AnimusLab Sovereign Infrastructure",
      domain: "animuslab.dev",
      orgType: OrgType.ENTERPRISE,
      region: "GL",
      contractTier: ContractTier.SOVEREIGN,
      status: UserStatus.APPROVED,
    },
  });

  const rbiOrg = await prisma.organization.create({
    data: {
      id: "rbi-org-in",
      displayName: "Reserve Bank of India (RBI)",
      domain: "rbi.org.in",
      orgType: OrgType.REGULATORY_BODY,
      region: "IN",
      contractTier: ContractTier.SOVEREIGN,
      status: UserStatus.APPROVED,
    },
  });

  // 3. Provision Hubs
  console.log("🌐 Provisioning Headquarters Hub...");
  const hqHub = await prisma.hub.create({
    data: {
      id: "animuslab-hq",
      orgId: animusOrg.id,
      displayName: "AnimusLab Headquarters Hub",
      region: "US-EAST-1",
      unit: "HQ-01",
      apiKeyHash: "sha256_animuslab_hq_key_2026_tan",
      regulatoryVisible: true,
      isActive: true,
    },
  });

  // 4. Provision Projects
  console.log("📁 Provisioning Projects...");
  const coreProject = await prisma.project.create({
    data: {
      id: "proj_core_engine",
      hubId: hqHub.id,
      name: "Core Engine & Governance Matrix",
      slug: "core-engine",
      apiKeyHash: "sha256_proj_core_engine_key_2026",
    },
  });

  // 5. Provision 1 Root Admin (Level 5) in AdminUser table
  console.log("👑 Provisioning [1/7] Root Admin (ANIMUS_ADMIN)...");
  const rootAdmin = await prisma.adminUser.create({
    data: {
      id: "AN-ADMIN-TAN",
      email: "tan@animuslab.dev",
      displayName: "Tan (Root Admin)",
      role: AdminRole.ANIMUS_ADMIN,
      totpSecret: TOTP_SECRET,
      status: UserStatus.APPROVED,
    },
  });

  // 6. Provision 1 Hub Manager (Level 3) in User table
  console.log("👔 Provisioning [2/7] Hub Manager (HUB_MANAGER)...");
  const hubManager = await prisma.user.create({
    data: {
      id: "TAN-MGR-L3",
      email: "manager@animuslab.dev",
      displayName: "Tan Manager",
      role: Role.HUB_MANAGER,
      orgId: animusOrg.id,
      hubId: hqHub.id,
      totpSecret: TOTP_SECRET,
      status: UserStatus.APPROVED,
    },
  });

  // 7. Provision 1 Project Lead (Level 2) in User table
  console.log("🎯 Provisioning [3/7] Project Lead (PROJECT_LEAD)...");
  const projectLead = await prisma.user.create({
    data: {
      id: "ALE-PJ-L2",
      email: "lead@animuslab.dev",
      displayName: "Alex Lead",
      role: Role.PROJECT_LEAD,
      orgId: animusOrg.id,
      hubId: hqHub.id,
      projectId: coreProject.id,
      totpSecret: TOTP_SECRET,
      status: UserStatus.APPROVED,
    },
  });

  // 8. Provision 1 Developer (Level 1) in User table
  console.log("💻 Provisioning [4/7] Developer (DEVELOPER)...");
  const developer = await prisma.user.create({
    data: {
      id: "DAV-DEV-L1",
      email: "dev@animuslab.dev",
      displayName: "David Dev",
      role: Role.DEVELOPER,
      orgId: animusOrg.id,
      hubId: hqHub.id,
      projectId: coreProject.id,
      totpSecret: TOTP_SECRET,
      status: UserStatus.APPROVED,
    },
  });

  // 9. Provision 1 Standard Auditor (Level 1) in User table
  console.log("🔍 Provisioning [5/7] Standard Auditor (STANDARD_AUDITOR)...");
  const standardAuditor = await prisma.user.create({
    data: {
      id: "AUD-SA-L1-001",
      email: "auditor.standard@animuslab.dev",
      displayName: "Sam Standard Auditor",
      role: Role.STANDARD_AUDITOR,
      orgId: animusOrg.id,
      hubId: hqHub.id,
      totpSecret: TOTP_SECRET,
      status: UserStatus.APPROVED,
    },
  });

  // 10. Provision 1 Cross-Hub Auditor (Level 2) in User table
  console.log("🌐 Provisioning [6/7] Cross-Hub Auditor (CROSS_HUB_AUDITOR)...");
  const crossHubAuditor = await prisma.user.create({
    data: {
      id: "AUD-CH-L2-001",
      email: "auditor.crosshub@animuslab.dev",
      displayName: "Chris Cross-Hub Auditor",
      role: Role.CROSS_HUB_AUDITOR,
      orgId: animusOrg.id,
      hubId: null,
      totpSecret: TOTP_SECRET,
      status: UserStatus.APPROVED,
    },
  });

  // Assign Cross-Hub Auditor to animuslab-hq hub
  await prisma.userHubAssignment.create({
    data: {
      userId: crossHubAuditor.id,
      hubId: hqHub.id,
      grantedBy: rootAdmin.id,
      reason: "Global institutional oversight authorization",
    },
  });

  // 11. Provision 1 Regulatory Auditor (Level 4) in User table
  console.log("🏛️ Provisioning [7/7] Regulatory Auditor (REGULATORY_AUDITOR)...");
  const regulatoryAuditor = await prisma.user.create({
    data: {
      id: "AUD-RBI-L4-001",
      email: "auditor.rbi@animuslab.dev",
      displayName: "RBI Regulatory Auditor",
      role: Role.REGULATORY_AUDITOR,
      orgId: rbiOrg.id,
      jurisdiction: "RBI",
      hubId: null,
      totpSecret: TOTP_SECRET,
      status: UserStatus.APPROVED,
    },
  });

  // 12. Provision Whitelist & Telemetry Baseline
  console.log("📋 Registering Whitelist records...");
  const whitelistEntries = [
    { email: "tan@animuslab.dev", orgId: animusOrg.id, hubId: hqHub.id, role: Role.HUB_MANAGER },
    { email: "manager@animuslab.dev", orgId: animusOrg.id, hubId: hqHub.id, role: Role.HUB_MANAGER },
    { email: "lead@animuslab.dev", orgId: animusOrg.id, hubId: hqHub.id, role: Role.PROJECT_LEAD },
    { email: "dev@animuslab.dev", orgId: animusOrg.id, hubId: hqHub.id, role: Role.DEVELOPER },
    { email: "auditor.standard@animuslab.dev", orgId: animusOrg.id, hubId: hqHub.id, role: Role.STANDARD_AUDITOR },
    { email: "auditor.crosshub@animuslab.dev", orgId: animusOrg.id, hubId: hqHub.id, role: Role.CROSS_HUB_AUDITOR },
    { email: "auditor.rbi@animuslab.dev", orgId: rbiOrg.id, hubId: null, role: Role.REGULATORY_AUDITOR },
  ];

  for (const entry of whitelistEntries) {
    await prisma.whitelist.create({
      data: {
        email: entry.email,
        orgId: entry.orgId,
        hubId: entry.hubId,
        role: entry.role,
        invitedBy: rootAdmin.id,
        status: UserStatus.APPROVED,
      },
    });
  }

  // 13. Register Ed25519 Cryptographic Identity Key for Tan
  await prisma.governanceIdentity.create({
    data: {
      projectName: "AnimusLab Root Engine",
      publicKeyPem: "-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEA8f92a11b8ca4549f2b828fc0e80112a\n-----END PUBLIC KEY-----",
      publicKeyFingerprint: "ED25519:8f92a11b8ca4549f2b828fc0e80112a",
      registeredBy: "tan@animuslab.dev",
      hubId: hqHub.id,
      status: "ACTIVE",
    },
  });

  console.log("\n=======================================================");
  console.log("✅ ALL 7 POSITIONS PROVISIONED SUCCESSFULLY!");
  console.log("=======================================================");
  console.log("1. Root Admin:          tan@animuslab.dev           | AN-ADMIN-TAN   | /admin");
  console.log("2. Hub Manager:         manager@animuslab.dev       | TAN-MGR-L3     | /hub");
  console.log("3. Project Lead:        lead@animuslab.dev          | ALE-PJ-L2      | /hub");
  console.log("4. Developer:           dev@animuslab.dev           | DAV-DEV-L1     | /hub");
  console.log("5. Standard Auditor:    auditor.standard@animuslab.dev | AUD-SA-L1-001 | /oversight");
  console.log("6. Cross-Hub Auditor:   auditor.crosshub@animuslab.dev | AUD-CH-L2-001 | /oversight");
  console.log("7. Regulatory Auditor:  auditor.rbi@animuslab.dev   | AUD-RBI-L4-001 | /oversight");
  console.log("-------------------------------------------------------");
  console.log("🔑 Static TOTP Code for testing: 123456");
  console.log("🔐 Base32 TOTP Secret: JBSWY3DPEHPK3PXP");
  console.log("=======================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
