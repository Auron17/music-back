# Artist App Backend (NestJS)

NestJS 10 + Fastify + Prisma 5 + PostgreSQL backend for the single artist music app.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Create DB: `createdb artistdb`

## Setup

```bash
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run prisma:seed
```

Default admin from `.env.example`: `admin / admin123`.

## Run

```bash
npm run start:dev
```

Server runs on `PORT` from `.env`, default `8080`.

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
