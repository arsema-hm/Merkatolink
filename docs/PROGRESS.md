# Progress

## Phase 0 — Foundation (completed; commit 5c9d833)

- [x] pnpm workspace directories, AGENTS.md, Docker Compose, environment template and CI workflow.
- [x] Fastify API with health/readiness, security headers, origin allow-list and rate limits.
- [x] Migration runner, fictional demo seed/reset, docs and smoke tests.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` passed at Phase 0 commit.
- [ ] Docker-backed DB execution unavailable because Docker Engine is not installed in this environment.

## Phase 1 — Core marketplace and ERP (in progress)

- [x] Added public API endpoints for terra directory, verified terra traders, and active trader catalog. Parameter validation and parameterized SQL have API tests.
- [x] Marketplace directory reads verified trader counts from API when available, with demo fallback.
- [x] Removed Supabase-only `auth.uid()`/`auth.users` assumptions from fresh local Postgres migration; added profile role enum, more workflow tables and RLS defaults.
- [x] Added SQL preview for Rate Shock, days-of-stock view, locked partial-payment limit check, and buyer credit-limit trigger.
- [x] Expanded fictional seed to ~58 catalog products, 20 buyers, 3 brokers, 150 orders/payments, 90 rates, and 60 days of price board samples.
- [ ] Validate migration against a real local Postgres 16 instance; Docker unavailable here.
- [x] Current API/web typecheck, formatting lint, unit tests and build pass after the catalog API/seed changes.
- [ ] Next.js migration attempt blocked: npm registry timed out downloading Next 16.4.5 and its Windows SWC binary; package manifest remains on working Vite so the app is not left half-migrated.
- [ ] Connect page listings to actual product/shop data and implement Next App Router migration.
- [ ] Complete auth, product/inventory workspace, SQL landed-cost and Rate Shock, orders, credit, commissions and invoice workflow.

## Known boundaries

Frontend remains Vite; API currently implements only health, placeholder session, and public catalog reads. It does not authenticate requests or enforce trader authorization on write routes (none exist yet). The current Rate Shock preview and checkout are client-side only. SQL RLS has not been exercised across roles; do not deploy for real traders.
