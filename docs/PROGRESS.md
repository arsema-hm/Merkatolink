# Progress

## Phase 0 — Foundation (complete locally; Docker verification unavailable)

- [x] Monorepo workspace with apps/web, apps/api, packages/db and packages/shared.
- [x] AGENTS.md conventions and install/dev/test/lint/typecheck/build/migration commands.
- [x] Docker Compose definitions for Postgres 16, MinIO and Mailpit.
- [x] Fastify API with `/healthz`, `/readyz`, helmet, allow-listed CORS and request rate limit.
- [x] Idempotent migration tracking plus fictional demo seed and explicitly confirmed reset.
- [x] `.env.example`, CI workflow, architecture/ERD/API/deployment/security/research/assumptions docs.
- [x] Tests: API health/readiness, Amharic catalog smoke check, DB migration static assertions.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` pass.
- [ ] Docker-backed DB migration execution not run: Docker Engine is not installed/available in this environment.

## Phase 1 — Core marketplace and ERP (not started)

Next: move the current Vite storefront to Next App Router, implement route layouts and auth, connect real terra/trader/catalog data through the API, then complete landed cost and Rate Shock in SQL and UI.

## Known boundaries

The storefront remains Vite, not Next. The API has health routes and a session placeholder only. No auth, user-scoped RLS proof, persistent order/credit/payment flow, storage, or live provider integration exists. The existing public shop/cart is still client-side demo state. Do not deploy for real traders.
