# MerkatoLink

A digital wholesale marketplace and mini-ERP organized by **terra**. The current repo has a terra-first demo storefront, an interactive but not yet persistent cart/checkout, and an early Fastify/PostgreSQL foundation. All catalog names and numbers in seed files are fictional.

## Quick start (local)

1. Install Node.js 22+ and pnpm 11 (`corepack enable`).
2. Copy `.env.example` to `.env` and set local-only values.
3. Start PostgreSQL, MinIO and Mailpit: `docker compose up -d`.
4. Install and launch: `pnpm install` then `pnpm dev`.
5. Web: `http://localhost:5173`; API: `http://localhost:4000/healthz` and `/readyz`.
6. Apply schema and demo seed: `pnpm db:migrate`, `pnpm db:seed`.

`pnpm db:reset` is destructive and requires `ALLOW_DEMO_RESET=yes`. Local sample credentials are not production credentials. Do not add real user records to the seed.

## Repository map

- `apps/web`: current React/Vite prototype. The requested Next.js migration is not finished yet.
- `apps/api`: Fastify health endpoints, origin allow-list, Helmet, rate limit and session placeholder.
- `packages/db`: Postgres migration, typed-by-SQL foundation, demo seed and reset scripts.
- `packages/shared`: shared Zod input schemas and types.
- `docker-compose.yml`: local Postgres 16, MinIO and Mailpit.

## Current vs. planned functionality

The terra directory and Rate Shock UI preview are present. Checkout, auth, SMS OTP, payments, ledger, SSE, route-level role authorization, storage uploads, invoices and role-specific workflows are not yet wired end to end. The frontend currently keeps cart/order state in memory. API readiness checks Postgres; a health response does not imply the business API is complete. The SQL policy foundation also needs a full role-by-role security review before real data or public deployment.

## Checks

`pnpm typecheck` · `pnpm lint` (Prettier format check) · `pnpm test` · `pnpm build`

## Data, tax and market research notice

The seed describes a synthetic demo market. It is not a source of real market statistics. Tax settings and landed-cost examples are editable illustrations, not tax advice; verify all rates and bases with the Ethiopian Customs Commission and a qualified professional. Research notes distinguish reported observations from assumptions; confirm the model with traders before presenting it as fact. No e-invoice integration or accreditation is claimed.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Do not deploy for real traders until authentication, full RLS, input validation, uploads, payment handling, audit guarantees and backups are completed and reviewed.
