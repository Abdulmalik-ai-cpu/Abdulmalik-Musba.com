# ADR-011: Testing strategy

Status: Accepted
Spec references: §64, §140.34, §65, §132, §133

## Context

§64 requires unit, integration, end-to-end, and security testing. §65 and §133
define the critical journeys that must work completely. The repository
currently has no tests, which means every claim about behaviour is unverified.

## Decision

Three levels, one runner per level, matching §140.34.

- **Unit and integration: Vitest.** Business logic (slug generation, reading
  time, visibility filtering), Zod schemas, and API integration against a real
  PostgreSQL database. §64 and the project rules forbid mocking real code
  paths, so integration tests exercise the actual database through Prisma
  rather than a stub.
- **End-to-end: Playwright.** The five critical journeys from §65: visitor
  browsing and contact, admin login and publish, article publishing, project
  management, and the contact workflow.
- **Security tests.** Authorization boundaries (an unauthenticated request to
  every admin route is rejected), visibility enforcement (private records never
  appear in public responses), upload validation, and rate limiting (§64).

Coverage is not a target in itself. A test exists because it guards a real
behaviour, not to raise a number.

## Alternatives considered

- **Jest everywhere.** Rejected: Vitest is faster and the only NestJS coupling
  is the test runner, which is replaceable. §140.34 prefers one consistent
  runner across the monorepo.
- **Mock-heavy integration tests.** Rejected by the project rules: they pass
  while the real system is broken.

## Consequences

- Positive: regressions caught before deploy; journeys provably work.
- Negative: integration and E2E suites need a database and a running stack in
  CI, which lengthens the pipeline.
