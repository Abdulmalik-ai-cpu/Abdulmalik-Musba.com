# ADR-001: Frontend architecture

Status: Accepted
Spec references: §140.3, §140.4, §140.15, §75, §76

## Context

The platform has two distinct frontends with different audiences and different
constraints. The public website must be fast, crawlable, and render real
content for anonymous visitors. The Super Admin portal is an authenticated
management application where interactivity matters more than first paint.

§140.3 requires Next.js for the public site with server rendering where
beneficial. §140.4 requires the admin portal to be a separate application that
shares packages with the public site but never duplicates business logic.

## Decision

Two Next.js 15 App Router applications in one monorepo:

- `apps/web` — public website. Server Components fetch content through the
  typed API client at request time. There is no direct database access from
  the frontend; the API is the only content source (§20, §119).
- `apps/admin` — Super Admin portal. Client components manage authenticated
  CRUD against the admin API. It is deployed independently so administrative
  routes are never exposed on the public origin (§143.9).

Both applications import the same `@portfolio/ui`, `@portfolio/types`,
`@portfolio/validation`, and `@portfolio/api-client` packages. Business rules
such as publish-state transitions live only in the API, so the two frontends
cannot drift.

## Alternatives considered

- **One Next.js app with an `/admin` route group.** Rejected: it couples the
  admin deployment to the public one and makes it easy to leak admin code into
  the public bundle.
- **A client-rendered SPA for the public site.** Rejected by §47 and §140.3:
  it sacrifices SEO and first-load performance for a content site.

## Consequences

- Positive: independent deploys, no duplicated logic, strong typing end to end.
- Negative: two build targets and two sets of environment variables to keep
  aligned.
