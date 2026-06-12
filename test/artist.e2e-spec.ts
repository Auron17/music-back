import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { buildApp } from './helpers';

describe('Artist E2E', () => {
  let app: NestFastifyApplication;
  let token: string;

  beforeAll(async () => {
    ({ app, token } = await buildApp());
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /artist public returns seeded artist', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/artist' });
    expect(res.statusCode).toBe(200);
    expect((JSON.parse(res.payload) as { data: { name: string } }).data.name).toBe('Default');
  });

  it('PUT /admin/artist with auth updates', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: '/api/v1/admin/artist',
      headers: { Authorization: `Bearer ${token}` },
      payload: { name: 'Renamed', bio: 'New bio' },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload) as { data: { name: string; bio: string } };
    expect(body.data.name).toBe('Renamed');
    expect(body.data.bio).toBe('New bio');
  });

  it('PUT /admin/artist without auth returns 401', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: '/api/v1/admin/artist',
      payload: { name: 'x' },
    });

    expect(res.statusCode).toBe(401);
  });
});
