# API status

## Implemented

- `GET /healthz`: process liveness; does not require the database.
- `GET /readyz`: dependency readiness; returns 503 if `DATABASE_URL` is missing/unavailable.
- `GET /v1/auth/session`: explicit unauthenticated skeleton response.
- `GET /v1/terras`: public terra directory and count of verified traders.
- `GET /v1/terras/:terraId/traders`: verified trader profile cards; validates a positive integer id.
- `GET /v1/traders/:traderId/catalog`: active wholesale catalog and units for a verified trader; validates UUID.
- `POST /v1/orders` (demo mode only): validates the buyer, delivery/payment choices, shop and catalog items, then saves a local demo order.
- `GET /v1/orders/demo` (demo mode only): returns local demo orders for the trader workspace. This is a local preview endpoint without authentication; never expose it to a public deployment.
- `PATCH /v1/orders/demo/:invoiceNo` (demo mode only): moves local demo orders through new → confirmed → delivered or cancelled. Confirming deducts stock by base units; cancelling a confirmed order restores it. Invalid transitions and insufficient stock are rejected.
- `POST /v1/orders` (PostgreSQL mode): creates the buyer, order and order lines in one database transaction, applies the trader VAT flag and delivery fee, and records an optional delivery landmark. Credit orders receive a 30-day due date and remain subject to the database credit-limit trigger. Confirmation stock deduction is performed by the SQL trigger.

Public catalog queries use parameterized SQL and fixed safe projections. The UI consumes the terra counts when API access is available and remains in labeled demo mode on failure.

## Planned

Production auth, role/tenant middleware, database order read/status APIs, product costs and rate shock RPC, payments, credit, commissions, invoices, price-board/RFQ, notifications, SSE and exports. OpenAPI generation is pending. Every business endpoint must enforce role and trader/buyer/broker scope server-side; a caller-supplied tenant id never proves access. The JSON demo store is for local fictional data only. The PostgreSQL order writer has not been exercised against a live database in this environment.
