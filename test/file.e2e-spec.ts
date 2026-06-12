import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { buildApp } from './helpers';

describe('File E2E', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    ({ app } = await buildApp());
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('upload requires auth', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/v1/files/upload/image' });
    expect(res.statusCode).toBe(401);
  });
});
