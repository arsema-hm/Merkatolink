# Proposal coverage audit

This audit maps the attached 28-problem proposal to the current repository. “Done” is reserved for items whose stated completion condition is evidenced here; a schema or mock screen alone is not completion. The project is a fictional local demo and is not ready for real businesses or production deployment.

| ID | Status | Evidence and remaining gap |
|---|---|---|
| P1 SQL and maintenance | Partial | `packages/db/migrations/0001_initial.sql`, `packages/db/supabase/schema.sql`, seed and DB tests provide constraints, functions and views. No verified backup/restore CI, DB health UI, or five-query EXPLAIN runbook. |
| P2 CMS | Missing | No block editor, draft/publish, page history, sitemap or SEO score verification. |
| P3 Brand management | Partial | Trader brand fields and storefront theme values exist in schema/catalog. No complete brand kit, guideline page, or cross-surface contrast tests. |
| P4 Poster design | Missing | No four-format poster editor/export flow. |
| P5 Social publishing | Missing | No content calendar, scheduled queue or Telegram bot delivery. |
| P6 ERP | Partial | Stock, transfers, suppliers and finance-related schema exist. No tested balanced ledger postings or trial balance. |
| P7 Fintech | Partial | Payment records/schema and FX history exist. No provider adapter, idempotent webhook or reconciliation workflow. |
| P8 Cybersecurity | Partial | Helmet, rate limiting, origin checks, parameterized catalog SQL and RLS foundations exist. Auth/RBAC, TOTP, tenant-isolation tests, threat model and scanning are incomplete. |
| P9 Python analytics | Missing | No Python service, forecasting baseline test or typed service contract. |
| P10 TypeScript quality | Partial | Strict TS checks pass. No component package/catalog or complete shared-schema coverage. |
| P11 B2B sales | Partial | Quantity tiers, credit fields and cart checkout exist. RFQ negotiation, live updates, statement and buyer approval flow are missing. |
| P12 E-commerce | Partial | Terra directory, trader catalog, search and cart exist. Demo checkout persists locally, supports status tracking and stock deduction/restoration. PostgreSQL order creation is implemented transactionally but not live-DB tested; secure tracking, wishlist, verified reviews, coupons, returns and disputes remain missing. |
| P13 Terra structure | Partial | Terra directory and per-terra traders are implemented in `apps/web/src/main.tsx` and API catalog routes. Slow-4G LCP criterion has not been measured. |
| P14 Many traders | Partial | Multi-trader schema, demo catalog and verified-only public listings exist. No onboarding/verification queue with audited changes. |
| P15 Brokers | Partial | Broker and commission schema/seed and order trigger exist. No tested end-to-end broker checkout or earnings UI. |
| P16 Credit and trust | Partial | Credit limits, due dates, payment records and aging view exist in SQL. No complete reminder, promise-to-pay or tested reputation flow. |
| P17 Price discovery | Partial | Price-board report schema and fictional history exist. No report/moderation UI, outlier test or 7/30/90-day chart. |
| P18 FX and import taxes | Partial | Landed-cost function, rate-shock view, rates and shipment tables exist. UI is illustrative; no 50-case TS/SQL parity or shipment comparison test. |
| P19 Deliveries | Partial | Pickup/porter/truck and fees plus local order status changes are implemented. SQL delivery tables exist; no delivery-specific event timeline, proof photo or map pin. |
| P20 VAT/invoice readiness | Partial | PostgreSQL checkout calculates VAT only for VAT-registered traders and creates invoice references. No tested PDF, full invoice fields or adapter-backed output. |
| P21 Language/calendar | Partial | Some Amharic catalog labels and ETB formatting exist. Main flows are not fully translated; no Ethiopian calendar toggle. |
| P22 Connectivity | Partial | Responsive storefront CSS exists. No installable PWA, offline cache or queued payment sync. |
| P23 Payment mix | Partial | Cash, transfer, mobile money and credit options exist in UI/schema. Split payment and reconciliation are not implemented end to end. |
| P24 Trust/disputes | Partial | Verified badges and dispute-related schema exist. No evidence upload, resolution workflow or audit proof. |
| P25 Reliability | Partial | Health/readiness, structured logs, request IDs and deployment docs exist. No tested dependency error page, backups or Sentry integration. |
| P26 Privacy/legal | Partial | Security and privacy notes exist. No reviewed Terms/Privacy flows, export or account deletion. |
| P27 Testing | Partial | API, DB and UI unit tests plus CI foundations exist. No Playwright/RLS/axe suite; current CI needs a clean green run. |
| P28 Documentation | Partial | README, architecture, API, ERD, deployment, research and assumptions docs exist. DB runbook and threat model are missing; PostgreSQL setup has not been validated here. |

## Current local demo boundary

The optional no-database API demo accepts validated catalog orders, persists them and stock counts under ignored `apps/api/.demo-data/`, and supports local status changes. Confirming an order deducts base-unit stock; cancelling a confirmed order restores it. A PostgreSQL order writer now uses a transaction and the existing stock/credit triggers, but live migration, seed and order-flow verification are blocked here because Docker is not installed. Do not use real personal, financial, tax or trader data.

## Verification snapshot

Record fresh results after each change with `corepack.cmd pnpm typecheck`, `corepack.cmd pnpm test`, `corepack.cmd pnpm lint` and `corepack.cmd pnpm build`. Database execution requires a running PostgreSQL service; no live DB result is claimed by this audit.
