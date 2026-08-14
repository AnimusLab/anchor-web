import { PrismaClient, OrgType, ContractTier, Role, AdminRole, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding AnimusLab Root Admin Credentials (ADMIN ONLY)...");

  // 1. Upsert AnimusLab Organization
  const org = await prisma.organization.upsert({
    where: { id: "animuslab" },
    update: {
      displayName: "AnimusLab Sovereign Infrastructure",
      domain: "animuslab.dev",
      orgType: OrgType.ENTERPRISE,
      contractTier: ContractTier.SOVEREIGN,
      status: UserStatus.APPROVED,
    },
    create: {
      id: "animuslab",
      displayName: "AnimusLab Sovereign Infrastructure",
      domain: "animuslab.dev",
      orgType: OrgType.ENTERPRISE,
      region: "GL",
      contractTier: ContractTier.SOVEREIGN,
      status: UserStatus.APPROVED,
    },
  });

  // 2. Upsert AnimusLab Primary Headquarters Hub (animuslab-hq)
  const hub = await prisma.hub.upsert({
    where: { id: "animuslab-hq" },
    update: {
      displayName: "AnimusLab Headquarters Hub",
      region: "US-EAST-1",
      unit: "HQ-01",
      isActive: true,
    },
    create: {
      id: "animuslab-hq",
      orgId: org.id,
      displayName: "AnimusLab Headquarters Hub",
      region: "US-EAST-1",
      unit: "HQ-01",
      apiKeyHash: "sha256_animuslab_hq_key_2026_tan",
      isActive: true,
    },
  });

  // Clean up legacy hub ID if exists
  try {
    await prisma.hub.deleteMany({ where: { id: "animuslab-prod" } });
  } catch (err) {}

  // 3. Remove Tan from standard User table (ENFORCE ADMIN-ONLY ISOLATION)
  try {
    await prisma.user.deleteMany({ where: { email: "tan@animuslab.dev" } });
  } catch (err) {}

  // 4. Upsert Tan in AdminUser Table ONLY (Root Control Plane Authority)
  const adminUser = await prisma.adminUser.upsert({
    where: { email: "tan@animuslab.dev" },
    update: {
      id: "AN-ADMIN-TAN",
      displayName: "Tan",
      role: AdminRole.ANIMUS_ADMIN,
      totpSecret: null, // Nullified for zero plaintext leakage
      status: UserStatus.APPROVED,
    },
    create: {
      id: "AN-ADMIN-TAN",
      email: "tan@animuslab.dev",
      displayName: "Tan",
      role: AdminRole.ANIMUS_ADMIN,
      totpSecret: null, // Nullified for zero plaintext leakage
      status: UserStatus.APPROVED,
    },
  });

  // 5. Upsert Whitelist Domain Entry for animuslab.dev
  await prisma.whitelist.upsert({
    where: { email: "tan@animuslab.dev" },
    update: {
      orgId: org.id,
      hubId: hub.id,
      role: Role.HUB_MANAGER,
      status: UserStatus.APPROVED,
    },
    create: {
      email: "tan@animuslab.dev",
      orgId: org.id,
      hubId: hub.id,
      role: Role.HUB_MANAGER,
      invitedBy: adminUser.id,
      status: UserStatus.APPROVED,
    },
  });

  // 6. Register Ed25519 Cryptographic Identity Key for Tan
  await prisma.governanceIdentity.upsert({
    where: { publicKeyFingerprint: "ED25519:8f92a11b8ca4549f2b828fc0e80112a" },
    update: {
      projectName: "AnimusLab Root Engine",
      registeredBy: "tan@animuslab.dev",
      hubId: hub.id,
      status: "ACTIVE",
    },
    create: {
      projectName: "AnimusLab Root Engine",
      publicKeyPem: "-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEA8f92a11b8ca4549f2b828fc0e80112a\n-----END PUBLIC KEY-----",
      publicKeyFingerprint: "ED25519:8f92a11b8ca4549f2b828fc0e80112a",
      registeredBy: "tan@animuslab.dev",
      hubId: hub.id,
      status: "ACTIVE",
    },
  });

  console.log("✅ Tan (tan@animuslab.dev) is now scoped EXCLUSIVELY to AdminUser table (Root Admin Portal only)!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
