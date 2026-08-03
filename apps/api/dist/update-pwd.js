"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
async function updatePassword() {
    try {
        const hashedPassword = await bcrypt_1.default.hash('admin123', 10);
        await prisma_1.prisma.user.update({
            where: { email: 'admin@micomercio.com' },
            data: { password: hashedPassword }
        });
        console.log('Password updated successfully');
    }
    catch (error) {
        console.error('Failed to update password:', error);
    }
    finally {
        await prisma_1.prisma.$disconnect();
    }
}
updatePassword();
