// Script to create sample admin users for testing
// Run: npx tsx scripts/create-admin.ts

import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { hashPassword } from '../lib/auth';

interface AdminConfig {
  username: string;
  password: string;
  name: string;
  role: 'SUPER_ADMIN' | 'DEPT_ADMIN';
  placeOfWork: string;
  position: string;
  email: string;
  phone: string;
}

const admins: AdminConfig[] = [
  {
    username: 'admin',
    password: 'admin123!',
    name: 'Test Super Admin',
    role: 'SUPER_ADMIN',
    placeOfWork: 'Ministry of Public Administration',
    position: 'System Administrator',
    email: 'admin@govsewana.lk',
    phone: '0770000000',
  },
  {
    username: 'deptadmin',
    password: 'dept123!',
    name: 'Ministry Admin',
    role: 'DEPT_ADMIN',
    placeOfWork: 'Ministry of Public Administration',
    position: 'Senior Administrative Officer',
    email: 'deptadmin@govsewana.lk',
    phone: '0771112233',
  },
];

async function main() {
  console.log('🔧 Creating/updating admin users...\n');

  for (const admin of admins) {
    const hashed = await hashPassword(admin.password);

    const existing = await prisma.user.findFirst({
      where: { username: admin.username },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { password: hashed, role: admin.role },
      });
      console.log(`✅ ${admin.role} "${admin.username}" — password reset`);
    } else {
      const user = await prisma.user.create({
        data: {
          name: admin.name,
          username: admin.username,
          password: hashed,
          role: admin.role,
          placeOfWork: admin.placeOfWork,
          position: admin.position,
          emailAddress: admin.email,
          mobileNumber: admin.phone,
        },
      });
      console.log(`✅ ${admin.role} "${admin.username}" created (ID: ${user.id})`);
    }
  }

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║           ADMIN LOGIN CREDENTIALS                ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║                                                  ║');
  console.log('║  SUPER ADMIN (create admins)                     ║');
  console.log('║    Username: admin                               ║');
  console.log('║    Password: admin123!                           ║');
  console.log('║                                                  ║');
  console.log('║  DEPT ADMIN (manage bungalows & reservations)    ║');
  console.log('║    Username: deptadmin                           ║');
  console.log('║    Password: dept123!                            ║');
  console.log('║                                                  ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  🔗 Login: http://localhost:3000/admin/login     ║');
  console.log('╚══════════════════════════════════════════════════╝');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
