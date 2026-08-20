# frontend/ — Claude Context

Scope: `frontend/` (Vue 3 + TypeScript + Vuetify 4 + Pinia SPA, built with Vite). Read [../CLAUDE.md](../CLAUDE.md) and [../AGENTS.md](../AGENTS.md) first — this file only adds frontend-specific rules.

## EE/CE Stub Pattern

`src/_ee-stubs/{edition.ts,nav.ts,routes.ts}` are Community-edition no-ops for the `@ee` import alias. `vite.config.ts` resolves `@ee` → `./src/_ee` if that directory exists (private EE bundle), else falls back to `./src/_ee-stubs` — same import path either way, resolved at build time, no env flag. Stubs export empty route/nav arrays and `isExtension = false`; `router/index.ts` splices them into route children and gates a CE-only `/marketing` shell behind `!isExtension`.

**Import from `@ee`, never from a hardcoded `../_ee-stubs` path** — that defeats the alias and breaks in an EE checkout.

## API Calls: Use the Shared Instance

There is **no per-module API wrapper convention** here — `src/api/index.ts` exports one shared `api` axios instance (JWT interceptor, single-flight refresh-token rotation, 401/403/404/5xx handling). Composables import `api` directly and call `api.get/post/...` inline; that's where API-call logic lives, not in a `src/api/<domain>.ts` file. The two exceptions (`media.ts`, `public-branding.ts`) exist for specific reasons — `media.ts` because it has ~30 related endpoints worth grouping, `public-branding.ts` because it must run pre-auth and deliberately bypasses the shared instance's 401 interceptor. Don't create a new per-domain `api/*.ts` file unless you have a similarly concrete reason; default to calling `api` from the composable.

## State: Pinia Is Not the Default

Only 3 Pinia stores exist (`auth.ts`, `rbac.ts`, `privacy.ts`) — all cross-cutting session/permission concerns. Domain data (chat, contacts, friends, groups, appointments, etc.) lives in **composables** (`src/composables/use-*.ts`), which own their own reactive state and `api` calls. If you're adding state for a new domain feature, default to a composable, not a new Pinia store — that matches the existing pattern and avoids introducing a second competing state layer.

## Component Size

Several files have grown very large: `components/chat/MessageThread.vue` (~4,165 lines), `views/ContactsView.vue`, `components/chat/ConversationFilterSidebar.vue`, `components/chat/ChatContactPanel.vue`, `components/chat/ConversationList.vue` — chat/ is the worst offender. When adding functionality to one of these files, prefer extracting a new sub-component over growing the file further; don't treat their current size as precedent to match.

## Testing

Coverage is sparse (2 spec files total). The established pattern when logic needs a test is: extract the pure/testable part into a dedicated `*-logic.ts` file, then unit-test that file directly — see `use-work-scope.ts` (composable, owns reactive state and API calls) paired with `work-scope-logic.ts` (pure functions) and `work-scope-logic.spec.ts` (tests). Don't attempt to mount-test Vuetify-heavy components; extract the logic instead.

## Routing & RBAC Guard

`router/index.ts` is a single file, fully lazy-loaded (`() => import(...)` per route). The RBAC guard reads `meta.resource`/`meta.action` off the route and checks `authStore.canAccess(resource, action)` — set these on any new protected route rather than checking permissions manually inside the view component.

## Styling: Two Token Systems Coexist

Vuetify's theme (`src/plugins/vuetify.ts`, `hsLight` default) and a separate hand-written CSS custom-property system (`--smax-*` in `assets/tokens.css`, consumed by `DefaultLayout`/`ChatView`/`ContactsView`/`FriendsView`) both exist and are not unified. Match whichever system the file you're editing already uses — don't introduce a third styling approach, and don't assume changing one theme updates the other.

## Not Yet Wired Up

`vite-plugin-pwa` is a dependency but has no `VitePWA(...)` call in `vite.config.ts` — there's no service worker or manifest despite the package being installed. Don't assume PWA features (offline support, installability) work; if asked to add them, they need to be configured from scratch.
