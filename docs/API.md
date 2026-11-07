# API status

## Implemented

- `GET /healthz`: process liveness; does not require the database.
- `GET /readyz`: dependency readiness; returns 503 if `DATABASE_URL` is missing/unavailable.
- `GET /v1/auth/session`: explicit unauthenticated skeleton response.

## Planned

Versioned Zod-validated routes for auth, terra/trader/catalog, product costing and rate shock, orders/payments, credit, broker earnings, invoices, price-board/RFQ, notifications, and exports. OpenAPI generation is pending. Every business endpoint must enforce role and trader/buyer/broker scope server-side; no route may accept a caller-supplied tenant id as proof of access.
