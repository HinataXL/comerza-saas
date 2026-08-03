"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const supertest_1 = __importDefault(require("supertest"));
const jwt_1 = require("./utils/jwt");
const prisma_1 = require("./lib/prisma");
async function test() {
    const admin = await prisma_1.prisma.user.findFirst();
    if (!admin) {
        console.log('No user found in db');
        return;
    }
    const token = (0, jwt_1.generateToken)({ id: admin.id, role: admin.role, tenantId: admin.tenantId });
    const res = await (0, supertest_1.default)(app_1.default)
        .get('/api/dashboard')
        .set('Cookie', [`token=${token}`]);
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(res.body, null, 2));
}
test().finally(() => prisma_1.prisma.$disconnect());
