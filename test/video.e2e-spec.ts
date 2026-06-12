import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { buildApp } from './helpers';

describe('Video E2E', () => {
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

  it('create extracts youtubeId and thumbnail', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/videos',
      headers: { Authorization: `Bearer ${token}` },
      payload: { title: 'Clip', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload) as {
      data: { youtubeId: string; thumbnailUrl: string };
    };
    expect(body.data.youtubeId).toBe('dQw4w9WgXcQ');
    expect(body.data.thumbnailUrl).toContain('hqdefault.jpg');
  });

  it('invalid url returns 400', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/videos',
      headers: { Authorization: `Bearer ${token}` },
      payload: { title: 'Bad', youtubeUrl: 'https://vimeo.com/abc' },
    });

    expect(res.statusCode).toBe(400);
  });
});
