# Code Rules

Project-specific rules that apply across `backend/` and `frontend/`. See [../../CLAUDE.md](../../CLAUDE.md) for full context on each item below.

## Backend

- Any query against an org-scoped Prisma model outside an HTTP request handler (cron, BullMQ worker, socket handler) must be wrapped in `withTenant(orgId, fn)` — see `backend/src/shared/tenant/tenant-context.ts`. Unwrapped access outside a request is a tenant-isolation bug, not a style issue.
- New routes use `requireGrant(resource, action)` (`modules/rbac/rbac-middleware.ts`), not the legacy `requireRole(...)`.
- New Enterprise/Community-differentiated behavior goes through `shared/ee-registry/*` hook tables — never a direct import from `src/_ee/*` in core module code, and never an inline `if (isEnterprise)` branch.
- New credential/secret-shaped model fields are `Bytes *Encrypted` columns via `shared/crypto/aes-gcm.ts`, never plain `String`.
- Every schema change ships with a generated migration (`npm run db:migrate` from `backend/`) — never hand-edit `schema.prisma` without one. Full detail in `backend/prisma/CLAUDE.md`.

## Frontend

- Composables call the shared `api` instance from `src/api/index.ts` directly — don't create a new per-domain `src/api/<name>.ts` wrapper unless there's a concrete reason (the existing two exceptions, `media.ts` and `public-branding.ts`, both have one).
- New domain state goes in a composable (`src/composables/use-*.ts`), not a new Pinia store — Pinia here is reserved for cross-cutting session/RBAC/privacy state (`auth`, `rbac`, `privacy` stores only).
- `@ee`-aliased imports only — never hardcode a path into `_ee-stubs/` or `_ee/`.
- New protected routes set `meta.resource`/`meta.action` for the router's RBAC guard rather than checking permissions manually inside the view.
- Don't add further bulk to `components/chat/MessageThread.vue` or the other already-oversized chat components — extract a sub-component instead.
