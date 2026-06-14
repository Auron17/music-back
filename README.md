# Artist App Backend (NestJS)

NestJS 10 + Fastify + Prisma 5 + Supabase Postgres backend for the single artist music app.

## Prerequisites

- Node.js 20+
- Supabase Postgres project

## Setup

```bash
cp .env.example .env
npm install
npx prisma migrate deploy
npm run prisma:seed
```

Default admin from `.env.example`: `admin / admin123`.

## Supabase Database Setup

Create a dedicated Prisma database user in Supabase SQL Editor:

```sql
create user "prisma" with password 'custom_password' bypassrls createdb;
grant "prisma" to "postgres";
grant usage on schema public to prisma;
grant create on schema public to prisma;
grant all on all tables in schema public to prisma;
grant all on all routines in schema public to prisma;
grant all on all sequences in schema public to prisma;
alter default privileges for role postgres in schema public grant all on tables to prisma;
alter default privileges for role postgres in schema public grant all on routines to prisma;
alter default privileges for role postgres in schema public grant all on sequences to prisma;
```

Set `.env`:

```bash
DATABASE_URL="postgresql://prisma.[PROJECT_REF]:[PRISMA_PASSWORD]@[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://prisma.[PROJECT_REF]:[PRISMA_PASSWORD]@[REGION].pooler.supabase.com:5432/postgres"
```

Use `DATABASE_URL` for the running API and `DIRECT_URL` for Prisma migrations.

## Run

```bash
npm run start:dev
```

Server runs on `PORT` from `.env`, default `8080`.

## Render Deploy

Use these settings on Render:

```bash
Build Command: npm ci && npm run render:build
Start Command: npm run start
```

`npm run start` runs compiled production code from `dist/src/main.js`. Do not use `nest start` on Render because it compiles at runtime and can exceed the memory limit.

## Endpoints

- `POST /api/v1/auth/login` - public
- `GET /api/v1/artist` - public
- `GET /api/v1/songs`, `GET /api/v1/songs/featured`, `GET /api/v1/songs/search?q=` - public
- `GET /api/v1/albums`, `GET /api/v1/albums/:id/songs` - public
- `GET /api/v1/videos`, `GET /api/v1/videos/:id` - public
- `POST/PUT/DELETE /api/v1/admin/**` - `Authorization: Bearer <token>`
- `POST /api/v1/files/upload/audio|image` - auth required
- `GET /files/**` - public static files

## Test

```bash
npm test
npm run test:e2e
```

E2E tests require PostgreSQL and a valid `DATABASE_URL`.

## Performance Notes

- Fastify adapter for low overhead HTTP handling
- Prisma pool can be tuned through `connection_limit` in `DATABASE_URL`
- List endpoints are paginated and capped at 100 items per page
- `playCount` and `viewCount` use atomic database increments
- Hot query indexes are defined in `prisma/schema.prisma`
