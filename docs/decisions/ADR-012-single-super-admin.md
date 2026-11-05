# ADR-012: Single Super Admin invariant

Status: Accepted
Date: 2026-11-05
Related: §6 (Single Super Admin Principle), §35 (Authorization), §82 (Admin content ownership)

## Context

The master prompt requires that the entire platform be controlled through one
central Super Admin Portal and that there be exactly one Super Admin. §35
allows the authorization model to be *architected* for future roles
(`EDITOR`, `CONTENT_MANAGER`, `ANALYST`, `ASSISTANT`) but forbids implementing
roles that are not needed.

The previous seed looked up the bootstrap account by email. That meant changing
`ADMIN_EMAIL` between deployments created a *second* `SUPER_ADMIN` row rather
than updating the existing account, quietly violating the single-admin rule.
Nothing at the database level prevented a duplicate either.

## Decision

Enforce "exactly one Super Admin" at two layers:

1. **Database.** A partial unique index on the constant `role` value:
   ```sql
   CREATE UNIQUE INDEX "AdminUser_single_super_admin_key"
     ON "AdminUser" ("role") WHERE "role" = 'SUPER_ADMIN';
   ```
   This makes a second `SUPER_ADMIN` impossible regardless of application code.
2. **Seed.** The seed looks up the existing Super Admin by role, reconciles the
   email when `ADMIN_EMAIL` changes, and throws if more than one exists.

The `role` column and the `SUPER_ADMIN` value are retained so the authorization
model stays open to the future roles in §35 without a schema change.

## Alternatives considered

- **Application-level guard only.** Rejected: any new code path (a migration, a
  script, a manual SQL session) could bypass it. A database constraint cannot.
- **A `Boolean isSuperAdmin` with a partial unique index on `true`.** Equivalent
  in effect but discards the role vocabulary §35 anticipates.
- **A singleton settings row holding the admin id.** Adds a join and a second
  source of truth for identity; the constraint is simpler and stricter.

## Consequences

- A deployment that changes `ADMIN_EMAIL` updates the existing account instead of
  creating a second administrator. Ownership transfers are explicit.
- Promoting a second user to `SUPER_ADMIN` fails at the database, which is the
  intended behaviour; supporting multiple administrators would require replacing
  this index and is out of scope (§6, §93).
- The constraint is migration `20261105140000_single_super_admin`.
