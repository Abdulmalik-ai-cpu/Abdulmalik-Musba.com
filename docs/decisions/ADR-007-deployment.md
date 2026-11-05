# ADR-007: Deployment

Status: Accepted
Spec references: §143.2, §143.3, §140.43–140.48, §115

## Context

§143.1 forbids a manually maintained VPS for the initial production system and
§143.2 names the default provider set. §143.40 requires the application to
remain portable despite those providers.

## Decision

Adopt the §143.46 default topology, with the application kept provider-neutral.

| Layer | Provider | Responsibility |
| --- | --- | --- |
| DNS / CDN / edge | Cloudflare | domain, TLS, WAF |
| Public web | Vercel | `apps/web` |
| Admin | Vercel | `apps/admin` |
| API | Railway | `apps/api` container |
| Worker | Railway | background jobs |
| Database | Supabase | PostgreSQL |
| Auth | first-party (ADR-004) | admin sessions |
| Storage | Supabase Storage via S3 adapter (ADR-005) | media |
| Cache / queue | Upstash | Redis |
| Email | Resend (ADR-008) | transactional |
| Errors | Sentry | monitoring |
| CI/CD | GitHub Actions | pipeline |

Domains follow §143.4: `example.com`, `admin.example.com`, `api.example.com`.
No domain is hardcoded; it comes from environment configuration (§143.4).

The API ships as a container (§143.11): production dependencies only, non-root,
runtime-injected environment, `/health` endpoint, graceful shutdown, no
persistent local state.

## Alternatives considered

- **Single VPS.** Rejected by §143.1.
- **Kubernetes.** Rejected by §143.44 as out of scope for a personal platform.
- **Terraform now.** Deferred by §140.47 until infrastructure complexity
  justifies it.

## Consequences

- Positive: minimal operational burden, portable application code.
- Negative: several managed providers to configure; documented in
  `docs/deployment`.
