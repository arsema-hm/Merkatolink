# Assumptions

- This is a pre-production build. No real traders, customers, phone numbers, prices or market statistics are represented.
- Existing visual work is retained in the Vite web app while the proposed Next.js migration is staged; a production launch must use one documented frontend stack.
- PostgreSQL is the system of record. The local API health endpoint is implemented; business routes and session management are not yet production-ready.
- SMS, payment, object storage and messaging integrations require merchant credentials and provider review; adapters will use local fakes until configured.
- Tax sequence/rates and e-invoice appearance are illustrative only. Validate with the relevant Ethiopian authority and professional advisors before operational use.
- Terra descriptions and workflow assumptions are hypotheses from desk research and must be confirmed with multiple real traders before public claims.
- The current schema and policies are a foundation, not a completed security review. Do not use real accounts or confidential data until role-specific RLS tests pass.
