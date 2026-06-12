import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const username = process.env.DEFAULT_ADMIN_USERNAME ?? 'admin';
  const password = process.env.DEFAULT_ADMIN_PASSWORD ?? 'admin123';

  const existing = await prisma.adminUser.findUnique({ where: { username } });
  if (!existing) {
    const hash = await bcrypt.hash(password, 10);
    await prisma.adminUser.create({ data: { username, password: hash } });
    console.info(`Seeded admin user: ${username}`);
  }

  const artistCount = await prisma.artist.count();
  if (artistCount === 0) {
    await prisma.artist.create({ data: { name: 'Artist Name', bio: '' } });
    console.info('Seeded default artist');
  }
}

void main().finally(async () => {
  await prisma.$disconnect();
});
