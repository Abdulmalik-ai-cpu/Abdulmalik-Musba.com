# ADR-006: Content model

Status: Accepted
Spec references: §7, §27, §28, §12, §13, §14, §19, §86, §87

## Context

The platform must outlive any single career stage (§7, §136). Content must be
time-aware, related, and versioned rather than a set of hand-edited pages.

## Decision

Model content as structured, time-aware entities with an explicit lifecycle.

- **Time-awareness.** Education, experience, research, projects, and talks
  carry start/end dates and a `current` flag; ordering is explicit via
  `sortOrder`.
- **Lifecycle.** `Visibility` (PUBLIC / PRIVATE / ARCHIVED) governs whether a
  record can appear publicly. `PublishStatus` (DRAFT / PUBLISHED / SCHEDULED /
  ARCHIVED) governs articles. The backend enforces both; the frontend never
  decides visibility (§52, §53).
- **Relationships.** Project→Research, Project→Publication, Publication→Project,
  Project→Media exist as foreign keys so related-content sections are derived,
  not duplicated (§19).
- **Revisions.** `Revision` stores prior article versions with a monotonic
  version number and a changelog (§14).
- **Archive over delete.** `ARCHIVED` states preserve history; destructive
  delete is deliberate and audited (§86, §87).
- **Canonical identity.** `Profile` is the single source of identity; no
  component hardcodes name, title, or biography (§8).

## Alternatives considered

- **A single `Content` table with a JSON payload.** Rejected by §28: it would
  make filtering, relating, and lifecycle queries impractical.
- **A separate timeline table duplicated from other entities.** Rejected by
  §10: the timeline is generated from structured records. `TimelineRecord`
  exists only for milestones that have no other home.

## Consequences

- Positive: content evolves without schema churn; relations power the public
  site automatically.
- Negative: more tables and joins than a flat CMS; mitigated by shared Zod
  schemas and generic admin CRUD.
