# ADR-002: Backend architecture

Status: Accepted
Spec references: §140.5, §140.6, §29, §74, §140.38

## Context

§74 prefers a modular monolith for the initial implementation. §93 forbids
distributed complexity that has no demonstrated need. The backend must still
be structured so that domains could be separated physically later if that ever
became necessary.

## Decision

A single NestJS 11 application at `apps/api` exposing a REST API under the
`/api` prefix. Domains are NestJS modules (`auth`, `admin`, `public`, `audit`,
`health`, `prisma`, plus `media`, `email`, `storage` introduced in this pass).

- **REST, not GraphQL.** §140.6 requires REST for v1. GraphQL would add a
  second contract to maintain with no consumer that needs it.
- **OpenAPI generated from decorators.** `SwaggerModule` serves `/api/docs`.
  The document is the API contract; typed clients are hand-kept in
  `packages/api-client` for now (see "Consequences").
- **Purpose-built response shapes.** The public service selects only public
  fields rather than returning whole rows (§118, §53).
- **Consistent error envelope** with a machine-readable code and the request
  correlation id (§140.74, §140.75).

## Alternatives considered

- **Microservices per domain.** Rejected by §74 and §93 for a single-owner
  platform.
- **tRPC.** Rejected: it couples the client to the server implementation and
  §140.38 wants an OpenAPI-shaped contract that external consumers could use.
- **Generated client from OpenAPI at build time.** Deferred: it adds a codegen
  step to CI. The hand-kept client is validated by the shared Zod schemas and
  will be replaced if drift appears.

## Consequences

- Positive: one deployable, one debug surface, domain boundaries still explicit.
- Negative: the typed client is maintained by hand until codegen is justified;
  a CI typecheck against the OpenAPI document mitigates drift.
