# ZCRM — Business Document

Business context for ZCRM. Update this file when a change shifts *why* the product exists or *who* it's for — not for routine feature work. Technical architecture lives in [CLAUDE.md](../CLAUDE.md) and [architecture/](architecture/); this file is scope-of-business only.

## What ZCRM Is

A self-hosted CRM purpose-built for sales teams that work over **Zalo** — the dominant consumer messaging platform in Vietnam. Rather than asking sales teams to switch tools, ZCRM connects directly to their existing Zalo accounts (via `zca-js`) and layers CRM structure — contacts, tags, deal stages, appointments, engagement scoring, reporting — on top of conversations that already happen in Zalo.

## Target Users

- **Vietnamese SMB sales/customer-service teams** already prospecting and closing over Zalo (the primary stated integration and the Vietnamese-language operational docs both point here).
- **Sales managers/admins** who need visibility across multiple Zalo accounts/nicks worked by a team — the RBAC (departments, teams, permission grants), audit log, and "Vận hành Nick Zalo" (Zalo-account-operations) report exist specifically for this oversight need.
- **Self-hosting operators** (technical enough to run Docker Compose) — there is no managed/SaaS offering; deployment is via `scripts/zalocrm-deploy.sh` against a self-hosted VPS or server.

## Value Proposition

- **Meet the customer where they already are.** No requirement for prospects/customers to adopt a new channel — CRM structure is added around existing Zalo conversations.
- **Team-scale Zalo operations.** Multiple Zalo accounts ("nicks") per org, group scanning, lead routing, and per-department RBAC — addressing the coordination problem that arises once more than one person is selling over Zalo.
- **Data ownership.** Self-hosted, AGPL-3.0-licensed core — an operator's customer/conversation data stays on infrastructure they control, not a third-party SaaS vendor's.
- **Adjacent-channel reach.** A Zalo↔Telegram bridge and a Facebook lead-import seam (`ee-registry/integrations.ts`) extend reach without requiring a second CRM.

## Business Model

Open-core, dual-licensed:

- **Community edition** (this codebase, as checked out): AGPL-3.0-or-later. Self-serve, free to run, source-disclosure obligation under AGPL §13 for any SaaS deployment (hence the "Mã nguồn" / source-code link required on the login page — see `CHANGELOG.md` v3.4.0).
- **Enterprise edition**: commercial dual-license, delivered as a separate `_ee` bundle that plugs into the open-core seam (`backend/src/shared/ee-registry/`, `frontend/src/_ee/`) without modifying Community-edition code. A commercial license key is a configured env var (`.env.example`), implying license-gated features rather than a forked codebase.
- **Trademark**: "ZCRM" name/branding is trademark-protected separately from the AGPL code license (`CONTRIBUTING.md`) — a fork must rebrand, not just relicense-compatible.

## Product Maturity Signal

Per `CHANGELOG.md`, `v3.4.0` (current, 2026-06-20) was a major release: UI/dashboard redesign, security hardening (refresh-token rotation, CSP, audit log), a new reporting suite, the Telegram bridge, and a full mobile-app API surface — indicating active investment beyond MVP, with `v1.x`–`v3.3.x` inherited as upstream history from the original `locphamnguyen/ZaloCRM` project this was forked/relicensed from.

## Open Questions (not derivable from code — confirm with stakeholders before relying on these for planning)

- Concrete business metrics/KPIs (active orgs, retention, conversion) — not present in this repo; likely tracked externally.
- Pricing/tiering of the commercial Enterprise license — the mechanism (license key + `_ee` bundle) is visible in code, the actual price points are not.
- Roadmap priorities beyond what's implied by the `CHANGELOG.md` Added/Changed sections.
