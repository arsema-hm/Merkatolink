# API status

## Implemented

- `GET /healthz`: process liveness; does not require the database.
- `GET /readyz`: dependency readiness; returns 503 if `DATABASE_URL` is missing/unavailable.
- `GET /v1/auth/session`: explicit unauthenticated skeleton response.
- `GET /v1/terras`: public terra directory and count of verified traders.
- `GET /v1/terras/:terraId/traders`: verified trader profile cards; validates a positive integer id.
- `GET /v1/traders/:traderId/catalog`: active wholesale catalog and units for a verified trader; validates UUID.

Public catalog queries use parameterized SQL and fixed safe projections. The UI consumes the terra counts when API access is available and remains in labeled demo mode on failure.

## Planned

Auth, role/tenant middleware, trader-owned write routes, product costs and rate shock RPC, orders/payments, credit, commissions, invoices, price-board/RFQ, notifications, SSE and exports. OpenAPI generation is pending. Every business endpoint must enforce role and trader/buyer/broker scope server-side; a caller-supplied tenant id never proves access.
