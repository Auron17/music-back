import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { buildApp } from './helpers';

describe('Auth E2E', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    ({ app } = await buildApp());
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('login with default credentials returns token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { username: 'admin', password: 'admin123' },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload) as { success: boolean; data: { token: string } };
    expect(body.success).toBe(true);
    expect(body.data.token).toBeTruthy();
  });

  it('login with bad password returns 401', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { username: 'admin', password: 'wrong' },
    });

    expect(res.statusCode).toBe(401);
    expect((JSON.parse(res.payload) as { success: boolean }).success).toBe(false);
  });
});
