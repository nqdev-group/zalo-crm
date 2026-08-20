# CLAUDE.md — ZCRM

Root guidance for AI agents. Read [AGENTS.md](AGENTS.md) for the full scope map. This file covers project-wide facts and invariants that apply everywhere; module-specific rules live in `backend/CLAUDE.md`, `frontend/CLAUDE.md`, `backend/prisma/CLAUDE.md`, `docs/CLAUDE.md`.

## Project Overview

**ZCRM** ("Zalo Sales CRM") is a self-hosted CRM for sales teams that work over [Zalo](https://zalo.me) (a Vietnamese messaging platform), integrating via the unofficial `zca-js` client library. Current line: `v3.4.x` (see `CHANGELOG.md`; `v1.x`–`v3.3.x` are upstream history from `locphamnguyen/ZaloCRM`). Licensed AGPL-3.0-or-later with a commercial dual-license and a "ZCRM" trademark clause (`README.md`, `CONTRIBUTING.md`) — PRs require both a CLA and DCO sign-off.

## Monorepo Layout

```
backend/    Fastify 5 + Prisma 7 + PostgreSQL API (independent npm project)
frontend/   Vue 3 + Vuetify 4 + Pinia SPA, built with Vite (independent npm project)
docker/     Single multi-stage Dockerfile (frontend build → backend build → runtime)
scripts/    install.sh / install.ps1, zalocrm-deploy.sh, storage-migration helpers
bin/        dev-setup / dev-teardown (git-worktree helpers, not deploy tooling)
docs/       Business/technical reference docs, architecture diagrams, API docs
assets/     Brand assets (logos) and marketing collateral
```

There is **no root `package.json`** and no npm/yarn workspaces — `backend/` and `frontend/` are built and versioned independently. A `.yarnrc.yml` + near-empty `yarn.lock` exist at root but are vestigial: nothing in the Dockerfile, compose files, or install scripts invokes yarn. All builds use `npm ci`/`npm install`. Don't assume workspace-style cross-package imports work.

There is **no CI/CD** (`.github/workflows/` does not exist). Don't reference CI checks that don't run; if you add tests, they're verified locally (`npm test` in each project) until a workflow is actually added.

## Critical Invariant: Multi-Tenancy

Every org-scoped Prisma model must be reachable from an active tenant context. The backend uses `AsyncLocalStorage` (`backend/src/shared/tenant/tenant-context.ts`) to carry `{orgId, userId, role}` through a request without threading it as a parameter, and a Prisma `$allOperations` guard (`tenant-guard.ts`) checks org-scoped models against a hardcoded allow-list. **Never write a query against an org-scoped model outside `withTenant()`/an entered request context** — see `backend/CLAUDE.md` for the full pattern and the explicit escape hatch (`runSystemQuery()`) for pre-auth lookups like login.

## Critical Invariant: EE/CE Open-Core Seam

This is an open-core product: Community edition code must never import Enterprise code directly.

- **Backend**: `backend/src/shared/ee-registry/` exposes hook tables (`automation.ts`, `event-bus.ts`, `integrations.ts`) with safe no-op defaults. `app.ts` attempts a dynamic `import('./_ee/index.js')`; in Community edition `backend/src/_ee/` doesn't exist, the import throws, and it's swallowed with a log line. An EE bundle calls `registerAutomationHooks()`/etc. at boot to override the defaults.
- **Frontend**: `frontend/vite.config.ts` resolves the `@ee` alias to `./src/_ee` if present, else falls back to `./src/_ee-stubs` (empty route/nav arrays, `isExtension = false`). No env flag — presence of the directory is the switch.

If you're building a feature that has a CE/paid-tier distinction, extend these registries — don't hardcode a feature flag or a `if (isEnterprise)` branch inline in core code.

## Security Baseline

- Access tokens: 15-minute JWT + rotating refresh tokens (`backend/src/modules/auth/refresh-token-service.ts`).
- RBAC: prefer the grant-based system (`requireGrant(resource, action)` in `modules/rbac/rbac-middleware.ts`) over the legacy role-string check (`role-middleware.ts`) for new routes.
- Secrets at rest: AES-256-GCM via `backend/src/shared/crypto/aes-gcm.ts`, keyed by `ENCRYPTION_KEY`/`FB_TOKEN_ENC_KEY`. Never add a plaintext `String` column for anything credential-shaped — see `backend/prisma/CLAUDE.md`.
- `backend/src/config/index.ts` fail-fasts in production if `JWT_SECRET`/`ENCRYPTION_KEY` are unset, default, or under 32 characters — don't work around this for convenience.

## Testing Posture

- **Backend**: not sparse — 83 `*.test.ts` files (`backend/tests/`, plus module-colocated tests), including a `tests/security/` suite (tenant-guard, socket-auth, hmac). `vitest.config.ts` fakes `DATABASE_URL` so Prisma-importing unit tests don't need a live DB.
- **Frontend**: sparse — only 2 spec files exist. The established pattern is extracting pure logic out of a large component/composable into a dedicated `*-logic.ts` file and unit-testing that in isolation (see `use-work-scope.ts` / `work-scope-logic.ts` / `work-scope-logic.spec.ts`). Follow this pattern rather than trying to mount-test Vuetify components.

## Deployment

Docker Compose (`docker-compose.yml`): `app`, `db` (Postgres 16), `redis`, `minio` (S3-compatible storage — API port is intentionally public so Zalo's CDN can fetch attachment URLs), `minio-init`, `backup`, `clamav` (optional, fail-open by default). No reverse proxy service — TLS termination is left to an external nginx/Caddy on the host, per the compose file's own comments. `scripts/zalocrm-deploy.sh` is the install/upgrade orchestrator; don't hand-roll deploy steps that duplicate it.

## Where to Go Next

- Touching backend routes/services/queues → [backend/CLAUDE.md](backend/CLAUDE.md)
- Touching the Prisma schema/migrations → [backend/prisma/CLAUDE.md](backend/prisma/CLAUDE.md)
- Touching the Vue SPA → [frontend/CLAUDE.md](frontend/CLAUDE.md)
- Touching docs/specs → [docs/CLAUDE.md](docs/CLAUDE.md)
