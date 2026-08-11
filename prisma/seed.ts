import { PrismaClient, OrgType, ContractTier, Role, AdminRole, UserStatus, EntityType } from "@prisma/client";
import { authenticator } from "otplib";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Governance Database...");

  // 1. Create Default Organizations
  const enterpriseOrg = await prisma.organization.upsert({
    where: { id: "animuslab" },
    update: {},
    create: {
      id: "animuslab",
      displayName: "AnimusLab Enterprise",
      domain: "animuslab.dev",
      orgType: OrgType.ENTERPRISE,
      region: "IN",
      contractTier: ContractTier.SOVEREIGN,
      status: UserStatus.APPROVED,
    },
  });

  const jpmcOrg = await prisma.organization.upsert({
    where: { id: "jpmc" },
    update: {},
    create: {
      id: "jpmc",
      displayName: "J.P. Morgan Chase",
      domain: "jpmc.com",
      orgType: OrgType.ENTERPRISE,
      region: "GL",
      contractTier: ContractTier.GROWTH,
      status: UserStatus.APPROVED,
    },
  });

  const rbiOrg = await prisma.organization.upsert({
    where: { id: "rbi" },
    update: {},
    create: {
      id: "rbi",
      displayName: "Reserve Bank of India (RBI)",
      domain: "rbi.org.in",
      orgType: OrgType.REGULATORY_BODY,
      region: "IN",
      status: UserStatus.APPROVED,
    },
  });

  // 2. Create Sovereign Hubs
  const jpmcHub = await prisma.hub.upsert({
    where: { id: "JPMC-IN-MUM01" },
    update: {},
    create: {
      id: "JPMC-IN-MUM01",
      orgId: jpmcOrg.id,
      displayName: "JPMC Mumbai AI Gateway",
      region: "IN",
      unit: "MUM01",
      apiKeyHash: "hash_jpmc_mumbai_hub_v6_001",
      entityType: EntityType.AI_AGENT,
      isActive: true,
    },
  });

  const solapurHub = await prisma.hub.upsert({
    where: { id: "AN-IN-SOL01" },
    update: {},
    create: {
      id: "AN-IN-SOL01",
      orgId: enterpriseOrg.id,
      displayName: "AnimusLab Solapur Node",
      region: "IN",
      unit: "SOL01",
      apiKeyHash: "hash_animus_solapur_hub_v6_001",
      entityType: EntityType.MESH_NODE,
      isActive: true,
    },
  });

  // 3. Create Root Admin User
  const adminTotpSecret = authenticator.generateSecret();
  await prisma.adminUser.upsert({
    where: { email: "tan@animuslab.dev" },
    update: {},
    create: {
      id: "AN-ADMIN-001",
      email: "tan@animuslab.dev",
      displayName: "Tanishq (Admin)",
      role: AdminRole.ANIMUS_ADMIN,
      totpSecret: adminTotpSecret,
      status: UserStatus.APPROVED,
    },
  });

  // 4. Create Hub Manager User
  const managerTotpSecret = authenticator.generateSecret();
  await prisma.user.upsert({
    where: { email: "dark.t.1030@gmail.com" },
    update: {
      hubId: solapurHub.id,
      orgId: enterpriseOrg.id,
      status: UserStatus.APPROVED,
      role: Role.HUB_MANAGER,
    },
    create: {
      id: "OWN-AN-SOLAPUR-990",
      email: "dark.t.1030@gmail.com",
      displayName: "Tanishq Dasari",
      role: Role.HUB_MANAGER,
      orgId: enterpriseOrg.id,
      hubId: solapurHub.id,
      totpSecret: managerTotpSecret,
      status: UserStatus.APPROVED,
    },
  });

  // 5. Create Regulatory Auditor User
  const auditorTotpSecret = authenticator.generateSecret();
  await prisma.user.upsert({
    where: { email: "rbi_auditor_09@rbi.org.in" },
    update: {
      orgId: rbiOrg.id,
      status: UserStatus.APPROVED,
      role: Role.REGULATORY_AUDITOR,
      jurisdiction: "RBI",
    },
    create: {
      id: "AUD-RBI-IN-009",
      email: "rbi_auditor_09@rbi.org.in",
      displayName: "Inspector R. K. Sharma",
      role: Role.REGULATORY_AUDITOR,
      orgId: rbiOrg.id,
      jurisdiction: "RBI",
      totpSecret: auditorTotpSecret,
      status: UserStatus.APPROVED,
    },
  });

  console.log("✅ Seed complete!");
  console.log("----------------------------------------");
  console.log("Admin Email:", "tan@animuslab.dev");
  console.log("Hub Manager Email:", "dark.t.1030@gmail.com | Hub ID: AN-IN-SOL01");
  console.log("Auditor Email:", "rbi_auditor_09@rbi.org.in | Org ID: rbi");
  console.log("----------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
