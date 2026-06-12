import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import compress from '@fastify/compress';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const adapter = new FastifyAdapter({ logger: false, bodyLimit: 60 * 1024 * 1024 });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter);
  const logger = new Logger('Bootstrap');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const uploadDir = process.env.UPLOAD_DIR ?? './uploads';
  mkdirSync(join(process.cwd(), uploadDir, 'audio'), { recursive: true });
  mkdirSync(join(process.cwd(), uploadDir, 'images'), { recursive: true });

  await app.register(helmet);
  await app.register(compress);
  await app.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } });
  await app.register(fastifyStatic, {
    root: join(process.cwd(), uploadDir),
    prefix: '/files/',
    decorateReply: false,
  });

  const origins = (process.env.CORS_ORIGINS ?? '*').split(',').map((origin) => origin.trim());
  app.enableCors({
    origin: origins.includes('*') ? true : origins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: false,
  });

  const port = Number(process.env.PORT ?? 8080);
  await app.listen(port, '0.0.0.0');
  logger.log(`Backend running on http://localhost:${port}`);
}

void bootstrap();
