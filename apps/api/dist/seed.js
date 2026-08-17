"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
async function main() {
    console.log('Seeding database...');
    // Create plans
    await prisma_1.prisma.plan.upsert({
        where: { code: 'PRO' },
        update: {},
        create: {
            code: 'PRO',
            name: 'Pro',
            monthlyPrice: 299,
            currency: 'GTQ',
            recurrentePlanId: 'TODO_PRO_PLAN_ID',
        },
    });
    await prisma_1.prisma.plan.upsert({
        where: { code: 'PREMIUM' },
        update: {},
        create: {
            code: 'PREMIUM',
            name: 'Premium',
            monthlyPrice: 499,
            currency: 'GTQ',
            recurrentePlanId: 'TODO_PREMIUM_PLAN_ID',
        },
    });
    // Create a tenant first
    const tenant = await prisma_1.prisma.tenant.create({
        data: { name: 'Comerza Demo', status: 'ACTIVE' }
    });
    // Create a default admin user
    const admin = await prisma_1.prisma.user.create({
        data: {
            tenantId: tenant.id,
            email: 'admin@micomercio.com',
            name: 'Carlos Méndez',
            password: await bcrypt_1.default.hash('admin123', 10),
            role: 'ADMIN',
        },
    });
    // Create a customer
    const customer1 = await prisma_1.prisma.customer.create({
        data: { tenantId: tenant.id, name: 'María López', email: 'maria@test.com' }
    });
    // Create products
    await prisma_1.prisma.product.createMany({
        data: [
            { tenantId: tenant.id, name: 'Audífonos Bluetooth', price: 250, stock: 4 },
            { tenantId: tenant.id, name: 'Cargador USB-C', price: 100, stock: 6 },
            { tenantId: tenant.id, name: 'Galaxy Watch 7 40mm', price: 1500, stock: 2 },
            { tenantId: tenant.id, name: 'Teclado Mecánico', price: 500, stock: 20 },
        ]
    });
    // Create some sales for current month
    const now = new Date();
    await prisma_1.prisma.sale.create({
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
    await prisma_1.prisma.sale.create({
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
    await prisma_1.prisma.$disconnect();
});
