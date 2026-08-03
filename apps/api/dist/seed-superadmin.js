"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
async function main() {
    console.log('Seeding SuperAdmin...');
    // Create a default SUPERADMIN user
    await prisma_1.prisma.user.upsert({
        where: { email: 'admin@comerza.com' },
        update: {},
        create: {
            email: 'admin@comerza.com',
            name: 'Comerza CEO',
            password: await bcrypt_1.default.hash('superadmin123', 10),
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
    await prisma_1.prisma.$disconnect();
});
