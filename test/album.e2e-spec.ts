import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { buildApp } from './helpers';

describe('Album E2E', () => {
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

  it('create, list, update and delete', async () => {
    const create = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/albums',
      headers: { Authorization: `Bearer ${token}` },
      payload: { title: 'First Album', releaseYear: 2024 },
    });
    const id = (JSON.parse(create.payload) as { data: { id: number } }).data.id;

    const list = await app.inject({ method: 'GET', url: '/api/v1/albums' });
    expect((JSON.parse(list.payload) as { data: Array<{ title: string }> }).data[0].title).toBe(
      'First Album',
    );

    const update = await app.inject({
      method: 'PUT',
      url: `/api/v1/admin/albums/${id}`,
      headers: { Authorization: `Bearer ${token}` },
      payload: { title: 'Renamed' },
    });
    expect((JSON.parse(update.payload) as { data: { title: string } }).data.title).toBe('Renamed');

    const remove = await app.inject({
      method: 'DELETE',
      url: `/api/v1/admin/albums/${id}`,
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(remove.statusCode).toBe(200);
  });
});
