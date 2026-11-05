# ADR-010: Backup strategy

Status: Accepted
Spec references: §45, §140.55, §140.56, §143.38, §143.39, §70

## Context

The portfolio is the owner's long-term digital asset (§70). A database backup
without the corresponding media backup is incomplete (§143.38), and a backup
that has never been restored is not trustworthy (§45).

## Decision

Two independent backup streams, both verifiable.

1. **Database.** Managed Supabase backups plus an application-level logical
   export. The `BackupRecord` model records each run, its size, status, and
   location so the admin can see backup history. A failed run is visible, not
   silent (§131).
2. **Media and documents.** Periodic export of the public and private buckets
   to a secondary destination in a different failure domain (§143.38).

A documented restore procedure lives in `docs/operations/RESTORE.md`. The
recovery model is: source code + database backup + media backup + environment
configuration + infrastructure documentation (§143.39).

Retention is configurable. Scheduled execution requires the worker (ADR-007);
until then backups are run by an operator and recorded through the API.

## Alternatives considered

- **Rely solely on the provider's automatic backups.** Rejected by §140.56.
- **Back up to the same provider and region.** Rejected by §143.38.

## Consequences

- Positive: recoverable, auditable, provider-independent.
- Negative: storage cost for the secondary copy; acceptable for a personal site.
