import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from './generated/prisma/client';
import bcrypt from 'bcrypt';

async function updatePassword() {
  const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
  const prisma = new PrismaClient({ adapter });

  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.update({
      where: { email: 'admin@micomercio.com' },
      data: { password: hashedPassword }
    });
    console.log('Password updated successfully');
  } catch (error) {
    console.error('Failed to update password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();
