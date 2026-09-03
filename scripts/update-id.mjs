import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { email: 'tan@animuslab.dev' },
    data: { id: 'TAN-MGR-L3', displayName: 'Tanishq' }
  });
  console.log('Successfully updated user record to new Clearance ID:', user.id);
}

main().finally(() => prisma.$disconnect());
