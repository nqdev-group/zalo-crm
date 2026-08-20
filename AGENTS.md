# AGENTS.md — Routing Guide

This file is the entry point for AI coding agents working in this repo. It does not contain rules itself — it points to the scoped `CLAUDE.md` that actually governs the file you're about to touch. Read the root [CLAUDE.md](CLAUDE.md) first for project-wide context, then the most specific file below that covers your target path.

## Scope Map

| Path | Guidance file | Covers |
|---|---|---|
| `/` | [CLAUDE.md](CLAUDE.md) | Project overview, monorepo layout, tenancy/security/EE invariants |
| `backend/` | [backend/CLAUDE.md](backend/CLAUDE.md) | Fastify API, module layering, auth/RBAC, queues/cron |
| `backend/prisma/` | [backend/prisma/CLAUDE.md](backend/prisma/CLAUDE.md) | Schema, migrations, seed, tenant-scoped models |
| `frontend/` | [frontend/CLAUDE.md](frontend/CLAUDE.md) | Vue 3 SPA, composables-as-store pattern, EE stubs, RBAC guard |
| `docs/` | [docs/CLAUDE.md](docs/CLAUDE.md) | Business/technical reference documentation (not code) |

## Resolution Rule

Most-specific `CLAUDE.md` wins; its parent(s) are fallback context, not overridden rules. A change under `backend/prisma/schema.prisma` is governed by `backend/prisma/CLAUDE.md` first, `backend/CLAUDE.md` second, root `CLAUDE.md` last.

## Fastest Orientation

- **What is this product?** Self-hosted CRM for sales teams working over Zalo (Vietnamese messaging platform). See `CLAUDE.md` → Project Overview.
- **Open-core model**: AGPL-3.0 + commercial dual-license. Community edition ships without the `backend/src/_ee/` and `frontend/src/_ee/` bundles — see `CLAUDE.md` → EE/CE Split.
- **Multi-tenant**: every org-scoped query must go through tenant context. See `backend/CLAUDE.md` → Tenant Context.
