# Prisma — Claude Context

Scope: `backend/prisma/` (schema, migrations, seed). Read [../CLAUDE.md](../CLAUDE.md) and [../../AGENTS.md](../../AGENTS.md) first — this file only adds schema/migration-specific rules.

## Before Editing `schema.prisma`

- [ ] Every new model that isn't a pure join table gets an `orgId String @map("org_id")` field with an `Organization` relation (`onDelete: Cascade`) — this is the tenant-isolation boundary described in `AGENTS.md`. A model with no `orgId` and no path back to one is a red flag.
- [ ] Follow the existing field-mapping convention: camelCase in the Prisma model, `@map("snake_case")` to the DB column, `@@map("snake_case_plural")` for the table name.
- [ ] Add composite indexes for the access patterns you're introducing — see `Contact` (`[orgId, phone]`, `[orgId, zaloUid]`) or `Conversation` (`[orgId, zaloAccountId, lastMessageAt]`) for the pattern: `orgId` first, then the filter/sort columns actually used in the new query.
- [ ] Anything provider-credential- or secret-shaped goes in a `Bytes` `*Encrypted` column (see `AppSetting.valueEncrypted`, `CustomAiProvider.apiKeyEncrypted`), encrypted/decrypted via `ENCRYPTION_KEY` in `shared/utils/crypto.ts` — never a plain `String` column.
- [ ] Status/type fields are plain `String` with a comment listing the allowed values (e.g. `status String @default("new") // new/contacted/interested/converted/lost`), not Prisma enums — match that pattern rather than introducing `enum` for a field sitting next to string-typed siblings.

## Migration Workflow

- [ ] Every schema change ships with a generated migration: `npm run db:migrate` (wraps `prisma migrate dev`) from `backend/`, then commit the new folder under `prisma/migrations/` alongside the schema change — never hand-edit `schema.prisma` without a corresponding migration.
- [ ] Don't use `db:push` (`prisma db push`) for anything meant to ship — it's schema-drift-only, for local prototyping, and produces no migration file.
- [ ] Check the generated SQL for destructive operations (dropped/renamed columns, added `NOT NULL` without a default) on tables likely to hold production data — Prisma will prompt about data loss during `migrate dev`; don't accept that blind.
- [ ] `prisma.config.ts` (not `schema.prisma`'s `datasource` block) is where the Prisma 7 driver adapter (`@prisma/adapter-pg`) is wired — if `DATABASE_URL` handling changes, check there too.

## Seed Data

`package.json` wires `db:seed` and the `"prisma": { "seed": "tsx prisma/seed.ts" }` config to `prisma/seed.ts`, but that file doesn't exist yet in this repo — `db:seed`/`migrate reset` will currently fail. If you add one, keep it idempotent (upsert, not create) so it's safe to re-run against a non-empty database.
