import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { buildApp } from './helpers';

describe('Song E2E', () => {
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

  const createSong = async (title: string): Promise<number> => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/songs',
      headers: { Authorization: `Bearer ${token}` },
      payload: { title, audioUrl: '/files/audio/x.mp3', durationSeconds: 180 },
    });

    return (JSON.parse(res.payload) as { data: { id: number } }).data.id;
  };

  it('public list works without auth', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/songs' });
    expect(res.statusCode).toBe(200);
  });

  it('create, get, play increments and search', async () => {
    const id = await createSong('My Song');
    let res = await app.inject({ method: 'GET', url: `/api/v1/songs/${id}` });
    expect((JSON.parse(res.payload) as { data: { playCount: number } }).data.playCount).toBe(0);

    await app.inject({ method: 'POST', url: `/api/v1/songs/${id}/play` });
    await app.inject({ method: 'POST', url: `/api/v1/songs/${id}/play` });

    res = await app.inject({ method: 'GET', url: `/api/v1/songs/${id}` });
    expect((JSON.parse(res.payload) as { data: { playCount: number } }).data.playCount).toBe(2);

    res = await app.inject({ method: 'GET', url: '/api/v1/songs/search?q=My' });
    const body = JSON.parse(res.payload) as { data: { content: Array<{ title: string }> } };
    expect(body.data.content[0].title).toBe('My Song');
  });

  it('featured returns top by playCount', async () => {
    const hot = await createSong('Hot');
    await createSong('Cold');
    await app.inject({ method: 'POST', url: `/api/v1/songs/${hot}/play` });
    await app.inject({ method: 'POST', url: `/api/v1/songs/${hot}/play` });
    await app.inject({ method: 'POST', url: `/api/v1/songs/${hot}/play` });

    const res = await app.inject({ method: 'GET', url: '/api/v1/songs/featured' });
    expect((JSON.parse(res.payload) as { data: Array<{ title: string }> }).data[0].title).toBe(
      'Hot',
    );
  });

  it('likes, lists liked songs and unlikes by deviceId', async () => {
    const songId = await createSong('Favorite Song');
    const deviceId = 'device-test-001';

    let res = await app.inject({
      method: 'POST',
      url: `/api/v1/songs/${songId}/like`,
      payload: { deviceId },
    });
    expect(res.statusCode).toBe(201);
    expect((JSON.parse(res.payload) as { data: { liked: boolean } }).data.liked).toBe(true);

    res = await app.inject({
      method: 'GET',
      url: `/api/v1/songs/liked?deviceId=${deviceId}`,
    });
    const likedBody = JSON.parse(res.payload) as {
      data: { content: Array<{ id: number; title: string }> };
    };
    expect(likedBody.data.content).toHaveLength(1);
    expect(likedBody.data.content[0].id).toBe(songId);

    res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/songs/${songId}/like?deviceId=${deviceId}`,
    });
    expect(res.statusCode).toBe(200);
    expect((JSON.parse(res.payload) as { data: { liked: boolean } }).data.liked).toBe(false);

    res = await app.inject({
      method: 'GET',
      url: `/api/v1/songs/liked?deviceId=${deviceId}`,
    });
    expect(
      (JSON.parse(res.payload) as { data: { content: Array<{ id: number }> } }).data.content,
    ).toHaveLength(0);
  });

  it('create without auth returns 401', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/songs',
      payload: { title: 'x', audioUrl: '/x.mp3' },
    });

    expect(res.statusCode).toBe(401);
  });

  it('create with missing album returns 404', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/songs',
      headers: { Authorization: `Bearer ${token}` },
      payload: { title: 'x', audioUrl: '/x.mp3', albumId: 999 },
    });

    expect(res.statusCode).toBe(404);
    expect((JSON.parse(res.payload) as { message: string }).message).toBe('Album not found: 999');
  });
});
