# Testing Rules

## Backend

- New business logic belongs in the `*-service.ts` layer and gets a colocated or `backend/tests/`-located `*.test.ts`. `backend/vitest.config.ts` fakes `DATABASE_URL` so Prisma-importing tests don't need a live database — use that rather than skipping tests that touch Prisma types.
- Security-sensitive changes (auth, tenant guard, socket auth, HMAC) need a test under `backend/tests/security/`, matching the existing suite there — don't ship a security-relevant change untested even if the surrounding module is otherwise light on tests.

## Frontend

- Coverage here is intentionally thin (2 spec files total) and that's an accepted tradeoff, not a gap to fill wholesale. When you do add logic worth testing, extract it into a pure, framework-free `*-logic.ts` file and unit-test that — mirror `use-work-scope.ts` / `work-scope-logic.ts` / `work-scope-logic.spec.ts`.
- Don't attempt to mount-test Vuetify-heavy components (no existing precedent, high setup cost relative to value here) — prefer the extraction pattern above.
- `frontend/vitest.config.ts` promotes `*.dom.spec.ts` files to a `jsdom` environment automatically; plain `*.spec.ts` files run in `node` for speed. Name new DOM-dependent spec files accordingly rather than changing the global environment.
