import { PrismaClient } from './generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcrypt';

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create a tenant first
  const tenant = await prisma.tenant.create({
    data: { name: 'Comerza Demo' }
  });
  
  // Create a default admin user
  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@micomercio.com',
      name: 'Carlos Méndez',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
    },
  });

  // Create a customer
  const customer1 = await prisma.customer.create({
    data: { tenantId: tenant.id, name: 'María López', email: 'maria@test.com' }
  });

  // Create products
  await prisma.product.createMany({
    data: [
      { tenantId: tenant.id, name: 'Audífonos Bluetooth', price: 250, stock: 4 },
      { tenantId: tenant.id, name: 'Cargador USB-C', price: 100, stock: 6 },
      { tenantId: tenant.id, name: 'Galaxy Watch 7 40mm', price: 1500, stock: 2 },
      { tenantId: tenant.id, name: 'Teclado Mecánico', price: 500, stock: 20 },
    ]
  });

  // Create some sales for current month
  const now = new Date();
  await prisma.sale.create({
    data: {
      tenantId: tenant.id,
      userId: admin.id,
      customerId: customer1.id,
      total: 1250,
      status: 'COMPLETED',
      paymentMethod: 'Tarjeta',
      felStatus: 'CERTIFICADA',
      createdAt: now
    }
  });

  // Create some sales for past months
  const pastMonth = new Date();
  pastMonth.setMonth(pastMonth.getMonth() - 1);
  await prisma.sale.create({
    data: {
      tenantId: tenant.id,
      userId: admin.id,
      customerId: customer1.id,
      total: 3450,
      status: 'COMPLETED',
      paymentMethod: 'Transferencia',
      felStatus: 'CERTIFICADA',
      createdAt: pastMonth
    }
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
