import 'dotenv/config';
import { hash } from 'argon2';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is required for seed');

const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await hash('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rentacar.local' },
    update: { password: hashedPassword, role: 'ADMIN' },
    create: {
      email: 'admin@rentacar.local',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('Seeded admin user:', admin.email);
  return { admin };
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
