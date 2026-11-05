# ADR-005: Storage

Status: Accepted
Spec references: §140.22, §140.58, §143.20–143.23, §37, §54

## Context

Media (images, PDFs, CVs, certificates, presentations) must be stored outside
the database (§143.20) and accessed through an abstraction so the provider can
change (§140.58, §143.40). Private files must never be reachable by a
predictable public URL (§16, §143.22).

The existing implementation writes uploads to a local disk path and returns
`/media/<filename>`. That works for a single long-lived process but breaks the
disposable-container requirement (§143.11) and gives no private/public split.

## Decision

Introduce a `StorageService` with a provider adapter interface.

- `LocalStorageAdapter` — development and single-node deployments. Writes under
  a configurable root outside the web root; private objects are served through
  an authenticated download endpoint, never a static path.
- `S3StorageAdapter` — production. Any S3-compatible endpoint, including
  Supabase Storage, MinIO, and R2, is reached through the same interface. The
  adapter is selected by configuration, not by code branching in callers.
- Buckets are logical: `portfolio-public` and `portfolio-private` (§143.21).
  `Media.storageClass` already models PUBLIC / PRIVATE / ADMIN_ONLY.
- Private objects are served as short-lived signed URLs issued only after the
  API has authorized the requesting admin (§143.22).
- Uploads are validated before storage: MIME sniffing, extension allow-list,
  and a size ceiling (§37, §140.54).

## Alternatives considered

- **Commit to Supabase Storage directly.** Rejected: it would embed provider
  assumptions in the domain and contradict §143.40.
- **Store binaries in PostgreSQL.** Rejected by §143.20.
- **Serve everything publicly and rely on unguessable names.** Rejected:
  security by obscurity violates §16.

## Consequences

- Positive: provider-portable, disposable containers, correct private handling.
- Negative: signed-URL issuance adds one API round trip for private downloads.
