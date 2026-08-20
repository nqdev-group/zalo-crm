# backend/ — Claude Context

Scope: `backend/` (Fastify 5 API, Prisma 7 + PostgreSQL, BullMQ/Redis, Socket.IO). Read [../CLAUDE.md](../CLAUDE.md) and [../AGENTS.md](../AGENTS.md) first — this file only adds backend-specific rules. For schema/migration work specifically, [prisma/CLAUDE.md](prisma/CLAUDE.md) takes precedence.

## Module Convention

Feature folders live under `src/modules/<name>/` (e.g. `contacts/`, `chat/`, `campaign/`, `engagement/`, `zalo/`). Within a module, filenames signal role:

- `*-routes.ts` — Fastify plugin, registers endpoints with `preHandler` auth/RBAC chains.
- `*-service.ts` — business logic + Prisma calls.
- `*-cron.ts` — `node-cron` scheduled jobs (e.g. `interaction-cron.ts`).
- `*-worker.ts` / `*-queue.ts` — BullMQ background processing.
- `*.test.ts` — colocated unit tests (vitest).

Layering is **routes → service → prisma client** (`shared/database/prisma-client.ts`). Don't call Prisma directly from a routes file for anything beyond trivial reads — put it in the service.

## Tenant Context (read before touching any org-scoped model)

`shared/tenant/tenant-context.ts` uses `AsyncLocalStorage` to carry `{orgId, userId, role, bypassTenantGuard}`.

- HTTP requests enter tenant context automatically in `auth-middleware.ts`. You don't need to do this yourself in a `*-routes.ts` handler.
- Anything running **outside** a request — cron jobs, BullMQ workers, socket handlers — must explicitly wrap DB access in `withTenant(orgId, fn)`. Forgetting this is the most likely way to leak cross-tenant data or silently no-op a query.
- `shared/tenant/tenant-guard.ts` enforces this via a Prisma `$allOperations` check against a hardcoded list of ~62 org-scoped model names (`org-scoped-models.ts`), controlled by `TENANT_GUARD_MODE` (`off`/`warn`/`enforce`). Treat `enforce` failures as bugs to fix, not guard behavior to bypass.
- Pre-tenant lookups (e.g. login, before `orgId` is known) use the explicit escape hatch `runSystemQuery()` — don't reach for `bypassTenantGuard` casually.

## EE/CE Registry

`shared/ee-registry/` (`automation.ts`, `event-bus.ts`, `integrations.ts`) defines hook tables with no-op defaults. If a feature needs an Enterprise-only variant:

1. Add the hook/event to the relevant registry with a safe CE default (no-op, or an explicit "not available in this edition" result).
2. Let the EE bundle (`src/_ee/`, not present in this checkout) call `register*()` at boot to override it.
3. Never import from `src/_ee/*` in core module code — the whole point of the seam is that Community builds work with `src/_ee/` absent.

The loader (`app.ts`) does a dynamic `import('./_ee/index.js')` and swallows the failure when absent — that's expected in this (Community) checkout.

## Auth & RBAC

- New routes: use `requireGrant(resource, action)` or `requireAnyGrant(...)` from `modules/rbac/rbac-middleware.ts`. The legacy `requireRole(...)` (`role-middleware.ts`) still exists for older routes — don't add new usages.
- Route-config annotations (`contentClass`, `rbacResource`) feed a Privacy redaction layer — set them when a route returns PII-adjacent data.
- Public API consumers (`modules/api/public-api-routes.ts`) authenticate via `X-Api-Key`, not JWT — a separate `apiKeyAuth` preHandler resolves `orgId` from the key. Don't mix this with the JWT auth chain.

## Queues, Cron, Realtime

- BullMQ uses a dedicated ioredis connection (`shared/queue/redis-connection.ts`, `maxRetriesPerRequest: null`) — separate from the general-purpose cache client (`shared/redis-client.ts`). Don't share them.
- `node-cron` jobs are started per-module via a `startXxxCron()` function called from `app.ts` — follow that registration pattern rather than starting a cron job as a side effect of module import.
- Socket.IO auth happens at handshake (`shared/realtime/socket-auth.ts`), joining `org:<orgId>`/`user:<userId>` rooms derived from the verified JWT (not client-supplied values — this was previously an IDOR). Sockets are disconnected when the access token expires; the frontend reconnects with a refreshed token.

## Config

`src/config/index.ts` is a single hand-parsed config object (no schema library) with a `requireSecret()` fail-fast for production secrets. Comments are largely in Vietnamese explaining each flag — keep that convention when adding new config, since it's the existing style in this file.

## Testing

`backend/tests/` (83 `*.test.ts` files) plus module-colocated tests. `vitest.config.ts` sets a fake `DATABASE_URL` so tests importing Prisma don't require a live database for pure-logic coverage; coverage is scoped to `src/modules/**` + `src/shared/**`. Add tests for new business logic in the service layer, not the routes layer.
