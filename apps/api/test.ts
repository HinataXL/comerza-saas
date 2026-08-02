import { prisma } from './src/lib/prisma';

async function test() {
  const users = await prisma.user.findMany({ include: { tenant: true }});
  for (const user of users) {
    if (user.tenant) {
      console.log(`User ${user.email} -> Tenant ${user.tenant.name} -> isActive: ${user.tenant.isActive}`);
      if (user.tenant.isActive === false) {
        console.log(`  BLOCKED!`);
      } else {
        console.log(`  ALLOWED!`);
      }
    }
  }
}
test();
