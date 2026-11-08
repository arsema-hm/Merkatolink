# MerkatoLink

**A digital wholesale marketplace and mini-ERP concept for Addis Ababa’s Merkato.** Browse by terra, discover fictional wholesale traders, build an order, and explore trader-side order and pricing tools.

> **Demo only:** All shops, people, contact details, prices and transactions are fictional. This repository is a portfolio prototype, not a production commerce or accounting system. Do not enter real customer or business data.

## Run the demo in VS Code (Windows)

Requirements: Node.js 22 or newer. Open this folder in VS Code, choose **Terminal → New Terminal**, then run:

```powershell
corepack.cmd pnpm install
corepack.cmd pnpm dev
```

Open the local Vite URL printed in the terminal (usually `http://localhost:5173`). If that port is busy, Vite selects another. The API starts on `http://localhost:4000`. Keep the terminal open while using the app; press **Ctrl+C** to stop both servers.

No database, Docker, `.env` file, or live credentials are required for the default demo. Demo checkout writes fictional orders and stock data beneath `apps/api/.demo-data/`; that directory is ignored by Git. The trader workspace can review orders, confirm them (which deducts stock), or cancel them (which restores stock after confirmation). The JSON store is local to one computer and is not designed for multiple users or deployment.

## What you can explore

- Browse the market by terra and open verified fictional trader profiles.
- Search and filter wholesale catalog listings; review unit and minimum-order information.
- Add products to a cart and submit a demo order with delivery and payment preferences.
- Open **Trader workspace (preview)** to change demo order status and explore the Rate Shock illustration.
- Read **How it works** and **About our website** for a plain-language introduction.

The public app uses the Fastify API for terra, trader and catalog data. Demo checkout and order status are validated by the API. In PostgreSQL mode, order creation writes buyer, order and order-line records in a transaction; the SQL trigger handles stock deduction when the order is confirmed. The current UI does not yet provide authenticated database-backed trader order management.

## PostgreSQL development (optional)

Docker Desktop must be installed and running. In PowerShell:

```powershell
Copy-Item .env.example .env
docker compose up -d
corepack.cmd pnpm db:migrate
corepack.cmd pnpm db:seed
corepack.cmd pnpm dev
```

The supplied `.env.example` values are local placeholders only. The database migration, seed, and PostgreSQL checkout path have not been validated against a live PostgreSQL server in the authoring environment. Resetting data is destructive and requires `ALLOW_DEMO_RESET=yes`; inspect the reset script before using it.

## Checks

Run before submitting changes:

```powershell
corepack.cmd pnpm typecheck
corepack.cmd pnpm test
corepack.cmd pnpm lint
corepack.cmd pnpm build
```

## Repository map

| Path | Purpose |
|---|---|
| `apps/web` | React + TypeScript storefront and trader workspace preview (Vite) |
| `apps/api` | Fastify API, demo JSON store and PostgreSQL catalog/order adapter |
| `packages/db/migrations` | Versioned PostgreSQL schema migration |
| `packages/db/supabase` | SQL reference schema and fictional seed data |
| `packages/shared` | Shared Zod schemas and TypeScript types |
| `docs` | Architecture, API, deployment, assumptions, research and proposal coverage audit |

## Proposal coverage and limitations

See [docs/PROBLEM_COVERAGE.md](docs/PROBLEM_COVERAGE.md) for the item-by-item status against the 28 requested problems. Several features are only schema foundations or previews. Authentication, complete tenant authorization, database-backed trader workflows, PDF invoices, payments, RFQs, analytics service, CMS, poster editor, social scheduling and production operations are not complete. The project must not be used with real traders until security, privacy, data integrity, tax and operational requirements are implemented and reviewed.

## Market, tax and privacy notes

Research notes distinguish sourced observations from assumptions and should be confirmed with traders. Seed tax and landed-cost values are illustrative, not tax advice. No Ethiopian e-invoice accreditation or live payment-provider integration is claimed. See [docs/RESEARCH.md](docs/RESEARCH.md), [docs/ASSUMPTIONS.md](docs/ASSUMPTIONS.md), [SECURITY.md](SECURITY.md) and [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## GitHub

After reviewing the demo and checks, create an empty GitHub repository, add its remote, then push the `main` branch. Keep `.env` and `.demo-data` out of commits; `.gitignore` already excludes them. Never commit real personal data or access tokens.
