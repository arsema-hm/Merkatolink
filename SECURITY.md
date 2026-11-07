# Security status

This repository is a development foundation and must not yet process real trader/customer data or payments.

## Current safeguards

- API uses Fastify, Helmet, explicit CORS origin list and request rate limiting.
- Environment template contains placeholders only; `.env*` files are ignored except `.env.example`.
- SQL includes constraints and an initial RLS pass; fictional seed only.

## Remaining before production

- Implement and threat-model phone OTP/email auth, secure httpOnly SameSite cookies, refresh rotation and CSRF.
- Enforce authorization in all API handlers and database RLS for every role; add automated cross-tenant access tests.
- Make audit records append-only for application roles and protect privileged operations.
- Validate images by content, dimensions and size; use private storage, signed URLs and malware scanning policy.
- Add CSP, dependency audit, secret scanning, webhook signatures/idempotency and structured request IDs.
- Review Postgres migration SQL, financial calculations, payment limits and stock locks with specialists.
- Establish backups, restore tests, monitoring, incident response and data retention/deletion policy.

Report security issues privately to the repository maintainer. Do not include credentials or personal data in issue reports.
