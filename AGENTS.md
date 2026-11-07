# MerkatoLink agent conventions

## Project structure

- `apps/web`: Vite/React public client (migration to Next.js is planned; do not silently mix frameworks).
- `apps/api`: Fastify HTTP API.
- `packages/db`: Postgres migrations, seed and maintenance scripts.
- `packages/shared`: shared runtime schemas/types.

## Commands

- Install: `pnpm install`
- Dev: `pnpm dev` (API + web; start Docker first)
- Test: `pnpm test`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Build: `pnpm build`
- Migrate: `pnpm db:migrate`
- Seed: `pnpm db:seed`
- Reset (destructive; requires `ALLOW_DEMO_RESET=yes`): `pnpm db:reset`

## Working rules

- Never commit credentials, real personal data, or unverified market/legal claims.
- Tax values and invoice design are examples only; label them in product UI and docs.
- Validate every external input, use parameterized SQL, enforce role and tenant authorization in API and RLS.
- Keep assumptions and incomplete security boundaries explicit. Tests must reflect the current implementation, not mask missing behavior.
- Before completing a phase, run checks, record outcomes in `docs/PROGRESS.md`, then commit only if the phase checks pass. If the environment prevents a check, document it and do not claim the phase passed.
