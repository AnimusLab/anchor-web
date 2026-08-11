import { PrismaClient, AdminRole, UserStatus } from "@prisma/client";
import { authenticator } from "otplib";

const prisma = new PrismaClient();

async function bootstrap() {
  const email = process.argv[2] || "tan@animuslab.dev";
  const displayName = process.argv[3] || "Tanishq (Admin)";

  console.log(`🔐 Bootstrapping Root Admin for: ${email}...`);

  // Generate a secret TOTP key for the admin
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, "AnimusLab Admin", secret);

  const admin = await prisma.adminUser.upsert({
    where: { email: email.toLowerCase() },
    update: {
      totpSecret: secret,
      status: UserStatus.APPROVED,
    },
    create: {
      id: `AN-ADMIN-${Math.floor(100 + Math.random() * 900)}`,
      email: email.toLowerCase(),
      displayName,
      role: AdminRole.ANIMUS_ADMIN,
      totpSecret: secret,
      status: UserStatus.APPROVED,
    },
  });

  console.log("--------------------------------------------------");
  console.log("✅ Root Admin Account Created!");
  console.log(`   Admin ID:    ${admin.id}`);
  console.log(`   Email:       ${admin.email}`);
  console.log(`   Role:        ${admin.role}`);
  console.log("--------------------------------------------------");
  console.log("🔑 YOUR 2FA TOTP SECRET KEY:");
  console.log(`   ${secret}`);
  console.log("--------------------------------------------------");
  console.log("📲 Add to Google Authenticator / Authy manually or using keyuri:");
  console.log(`   ${otpauth}`);
  console.log("--------------------------------------------------");
  console.log("🌐 Login at: https://admin.animuslab.dev/admin/login");
  console.log("--------------------------------------------------");
}

bootstrap()
  .catch((e) => {
    console.error("Bootstrap error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
