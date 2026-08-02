import { prisma } from './lib/prisma';
import bcrypt from 'bcrypt';

async function updatePassword() {

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
