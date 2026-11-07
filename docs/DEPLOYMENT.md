# Deployment guide (not production-ready yet)

## Local services

Copy `.env.example` to `.env`; use only local credentials. `docker compose up -d`, `pnpm install`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm dev`.

## Intended hosting

- Web on Vercel once the Vite-to-Next migration and route fallback configuration are settled.
- Fastify API on Fly.io or Render with HTTPS, allow-listed CORS, health checks, request logs, secrets management and autoscaling limits configured.
- PostgreSQL on managed Postgres (Neon or Supabase), with private credentials, backups, point-in-time recovery and reviewed RLS.
- S3-compatible storage such as Cloudflare R2 with private upload policies and server-side image validation/resizing.

## Before public launch

1. Complete OTP/email auth, secure cookies, CSRF controls and account/IP rate limits.
2. Complete and test tenant RLS and API authorization for every role.
3. Test schema migrations and seeded synthetic data against a disposable database.
4. Configure HTTPS, CSP, allowed origins, backups, restore drill, monitoring and incident contact.
5. Configure Chapa test mode first; verify signatures and idempotency; do not enable live settlement before provider onboarding.
6. Keep invoice registration placeholders clearly labeled and do not imply accreditation.
7. Set environment secrets only in the host dashboard; redeploy after config updates.

No live provider keys or production deployment are configured by this repository.
