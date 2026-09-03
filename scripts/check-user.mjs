import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: 'tan@animuslab.dev' },
    include: { organization: true, hub: true }
  });
  console.log("User table records for tan@animuslab.dev:");
  console.log(JSON.stringify(users, null, 2));

  const admins = await prisma.adminUser.findMany({
    where: { email: 'tan@animuslab.dev' }
  });
  console.log("\nAdminUser table records:");
  console.log(JSON.stringify(admins, null, 2));
}

main().finally(() => prisma.$disconnect());
