# Music-back CI/CD Design

**Date:** 2026-06-20
**Status:** Approved (pending spec review)

## Goal

Set up GitHub Actions CI/CD for `music-back` mirroring the existing `westep-backend` pattern: push to `main` triggers automated build, upload to VPS, and restart in a dedicated tmux session.

## Context

- **Repo:** `Auron17/music-back` (GitHub)
- **Stack:** NestJS 10 + Fastify + Prisma 5 + PostgreSQL
- **Server:** Same VPS as `westep-backend`, already set up
- **Existing state on server:**
  - PostgreSQL running locally with `artistdb` database
  - `.env` file in place at the project directory
  - App runs on `PORT=4040` (westep uses a different port; no conflict)
  - Reusable SSH credentials (same `HOST`, `USERNAME`, `PRIVATE_KEY` as westep)

## Architecture

```
[git push origin main]
        │
        ▼
[GitHub Actions: ubuntu-latest]
   1. Checkout
   2. Setup Node 20
   3. npm ci
   4. prisma generate
   5. nest build
        │
        ▼
[SCP artifacts to VPS:$MUSIC_BACK_PROJECT_DIR]
   - dist/
   - prisma/
   - package.json
   - package-lock.json
        │
        ▼
[SSH commands on VPS]
   1. cd $MUSIC_BACK_PROJECT_DIR
   2. npm ci                                       # install all deps (dev included, for ts-node)
   3. npx prisma generate                          # generate client for server platform
   4. npx prisma migrate reset --force --skip-seed # ⚠️ DROPS DB and re-applies all migrations
   5. npm run prisma:seed                          # re-create admin + default artist
   6. tmux kill-session -t music-back (if exists)
   7. tmux new-session -d -s music-back "node dist/src/main.js >> app.log 2>&1"
   8. Verify process up, print last log lines

**⚠️ Destructive policy:** every deploy wipes the database. All songs, albums, videos, and uploaded media references are lost. The `uploads/` folder on disk is NOT cleaned, so files become orphaned. This is intentional per project owner's request.
        │
        ▼
[App listening on PORT=4040 from .env]
```

## Differences from westep

| Element | westep-backend | music-back |
|---|---|---|
| Tmux session | `westep` | `music-back` |
| Build tool | Maven | npm + nest CLI |
| Artifact | single `.jar` | `dist/` + `prisma/` + package files |
| Run command | `java -jar westepBackend-0.0.1-SNAPSHOT.jar` | `node dist/src/main.js` |
| Restart | `tmux kill-session` + new | same |
| New step | n/a | `prisma migrate deploy` + `prisma:seed` |
| Port | westep's port | `4040` (from `.env`) |

## GitHub Secrets

| Secret | Source | Purpose |
|---|---|---|
| `HOST` | reuse from westep | VPS IP / hostname |
| `USERNAME` | reuse from westep | SSH user |
| `PRIVATE_KEY` | reuse from westep | SSH private key |
| `MUSIC_BACK_PROJECT_DIR` | **new** | absolute path on VPS, e.g. `/home/<user>/music-back` |

The `.env` file lives only on the server. It is NOT managed by CI/CD and NOT shipped from GitHub.

## Why `npm ci` (with devDeps) on the server

`prisma/seed.ts` uses `ts-node`, which is a devDependency. Two options were considered:

- **α (chosen):** `npm ci` installs all deps on the server. Disk overhead is small (~50MB); seed continues to work without code changes.
- β: Move `ts-node` to `dependencies` and use `npm ci --omit=dev`. Slightly leaner production install, but pollutes runtime deps with a build-time tool.

Chose α for simplicity and parity with the existing `npm run prisma:seed` script.

## File changes

- **New:** `.github/workflows/deploy.yml` — the CI/CD workflow
- **No code changes** to NestJS source

## Verification (post-deploy)

1. `tmux ls` on the VPS shows a `music-back` session.
2. `pgrep -f 'dist/src/main.js'` returns a PID.
3. `curl http://localhost:4040/api/v1/artist` returns 200.
4. `tail app.log` shows `Backend running on http://localhost:4040`.
5. `POST /api/v1/auth/login` with `admin / admin123` returns a JWT.

## Out of scope

- Nginx / reverse proxy config (already set up per option A).
- TLS certificates.
- Database backup/restore.
- Per-PR preview environments.
- Rollback automation (manual `git revert` + redeploy for now).
