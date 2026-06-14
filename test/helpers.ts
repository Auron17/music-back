import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

export interface TestApp {
  app: NestFastifyApplication;
  prisma: PrismaService;
  token: string;
}

export async function buildApp(): Promise<TestApp> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for e2e tests');
  }

  process.env.JWT_SECRET ??= 'test-secret-key-at-least-32-characters-long-xxxxx';
  process.env.JWT_EXPIRES_IN ??= '1h';
  process.env.UPLOAD_DIR ??= './test-uploads';
  process.env.DEFAULT_ADMIN_USERNAME ??= 'admin';
  process.env.DEFAULT_ADMIN_PASSWORD ??= 'admin123';

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  const prisma = app.get(PrismaService);
  await resetDb(prisma);
  await prisma.adminUser.create({
    data: { username: 'admin', password: await bcrypt.hash('admin123', 10) },
  });
  await prisma.artist.create({ data: { name: 'Default', bio: '' } });

  const loginRes = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    payload: { username: 'admin', password: 'admin123' },
  });
  const token = (JSON.parse(loginRes.payload) as { data: { token: string } }).data.token;

  return { app, prisma, token };
}

export async function resetDb(prisma: PrismaService): Promise<void> {
  await prisma.songLike.deleteMany();
  await prisma.song.deleteMany();
  await prisma.video.deleteMany();
  await prisma.album.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.adminUser.deleteMany();
}
