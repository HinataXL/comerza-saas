import { PrismaClient } from './generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcrypt';

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding SuperAdmin...');

  // Create a default SUPERADMIN user
  await prisma.user.upsert({
    where: { email: 'admin@comerza.com' },
    update: {},
    create: {
      email: 'admin@comerza.com',
      name: 'Comerza CEO',
      password: await bcrypt.hash('superadmin123', 10),
      role: 'SUPERADMIN',
      // tenantId is omitted, null by default since it's optional now
    },
  });

  console.log('SuperAdmin seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
