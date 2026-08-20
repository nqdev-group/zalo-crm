# docs/ — Claude Context

Scope: `docs/` (business and technical reference documentation, not code). Read [../AGENTS.md](../AGENTS.md) first.

## What Lives Here

- `Business-Document.md` (`docs/Business-Document.md`) — business context: goals, target users, value proposition. Update it when a change shifts *why* the product exists or who it's for, not for routine feature work.
- `docs/architecture/` — system architecture, backend module map, and data model diagrams, each kept in both source (`.excalidraw` / `.mmd`) and rendered (`.svg`/`.png`) form. Edit the source file and re-render; don't hand-edit the `.svg`/`.png` only.
- `docs/zalocrm-api/` — public REST API reference (`api-documentation.md` + Vietnamese translation + rendered PDF) and a Postman collection. This documents `backend/src/modules/api/public-api-routes.ts` (the `X-Api-Key`-authenticated surface), not the internal JWT-authenticated app API.
- `HUONG-DAN-*.md` — Vietnamese-language operational guides (Cloudflare R2 setup, Telegram bridge setup, production deployment). User/ops-facing, not architecture-facing — keep that separation rather than folding install steps into an architecture doc.
- `docs/release-images/` — versioned screenshots referenced from `README.md`'s release notes.

## Before Editing Architecture Docs or API Docs

- [ ] These describe intended/current behavior, not just current code — if you're documenting an existing implementation, verify the described behavior against the actual module (`backend/src/modules/<name>/`) rather than assuming the doc is still accurate; docs rot faster than code.
- [ ] `docs/zalocrm-api/api-documentation.md` and its `-vi.md`/`.pdf` counterparts must stay in sync — update all three together, not just the primary Markdown file.
- [ ] Keep architecture diagrams scoped to one concern (system architecture vs. backend module map vs. data model) rather than merging them into one oversized diagram.

## Adding a New Doc

Add a pointer to it from the relevant row in [../AGENTS.md](../AGENTS.md)'s scope map — a doc nothing links to won't get read.
