# ADR-003: Database

Status: Accepted
Spec references: §140.8, §140.9, §140.10, §28, §143.13

## Context

The portfolio is strongly relational: a project links to research, research to
publications, skills to projects, and every entity is time-aware. §140.8
requires PostgreSQL and §140.9 requires Prisma. §143.13 designates Supabase
PostgreSQL as the managed production database.

## Decision

PostgreSQL is the canonical source of truth, accessed through Prisma.

- The schema lives at `prisma/schema.prisma` and is the single definition of
  structured portfolio data.
- Every schema change is a committed migration under `prisma/migrations`.
  Production is never altered by hand (§140.10, §143.19).
- Relational modelling for anything queried, filtered, sorted, or related.
  JSON columns are reserved for genuinely schemaless data (audit before/after
  snapshots, integration config) and are never used to avoid modelling (§28).
- Supabase provides the managed PostgreSQL instance in production. Prisma
  connects with a standard `DATABASE_URL`, so the database is portable and the
  application carries no Supabase-specific database code (§143.40).
- Local development uses a plain PostgreSQL container (§140.40, §143.30), so
  developers do not depend on production infrastructure.

## Alternatives considered

- **MongoDB.** Rejected explicitly by §140.8: the data is relational.
- **Supabase client libraries for data access.** Rejected: it would couple the
  domain to a provider and duplicate the Prisma schema as a second source of
  truth (§126 forbids a second source of truth).
- **Raw SQL.** Permitted only with a documented reason and isolated (§140.9).

## Consequences

- Positive: referential integrity, one migration history, provider portability.
- Negative: Prisma's generated client must be regenerated after schema changes
  (handled by `postinstall` and CI).
