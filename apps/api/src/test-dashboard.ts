import app from './app';
import request from 'supertest';
import { generateToken } from './utils/jwt';
import { prisma } from './lib/prisma';

async function test() {
  const admin = await prisma.user.findFirst();
  if (!admin) {
    console.log('No user found in db');
    return;
  }

  const token = generateToken({ id: admin.id, role: admin.role, tenantId: admin.tenantId });
  const res = await request(app)
    .get('/api/dashboard')
    .set('Cookie', [`token=${token}`]);

  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(res.body, null, 2));
}

test().finally(() => prisma.$disconnect());
