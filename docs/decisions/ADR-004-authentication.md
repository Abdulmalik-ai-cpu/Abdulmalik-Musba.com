# ADR-004: Authentication

Status: Accepted
Spec references: §140.24–140.28, §143.15, §34, §35, §113, §114

## Context

§143.15 designates Supabase Auth as the default provider for the Super Admin
portal. The repository instead implements opaque bearer sessions backed by the
`AuthSession` table with bcrypt password hashes. §143.15 permits a substitute
only when provider-specific logic is isolated behind an application interface
and the choice is recorded.

The security properties the specification actually requires are: secure
login, session expiry and revocation, optional MFA, lockout/suspicious-login
protection, password recovery, and server-side authorization (§34, §143.16).
The current implementation already satisfies all of these except MFA and
password recovery.

## Decision

Retain the first-party session implementation for v1 and isolate it behind the
existing `AuthService`/`AuthGuard` boundary so a provider can replace it later
without touching domain modules.

- Passwords are hashed with **bcrypt** (cost 12). §140.27 prefers **Argon2id**
  and `argon2` is already a dependency; migrating is a scheduled follow-up that
  requires a rehash-on-login migration path. Recorded here rather than
  performed silently.
- Sessions are opaque 256-bit random tokens stored in `AuthSession` with an
  explicit `expiresAt` and `revokedAt`, so logout and admin revocation work
  server-side (§34).
- Failed logins increment `failedLoginAttempts` and write a `FAILED_LOGIN`
  audit record; `lockedUntil` supports lockout (§34, §38).
- Authorization is enforced in the API, never trusted from the client (§143.16).
  The single role is `SUPER_ADMIN`; §35 permits additional roles later without
  redesign.

## Alternatives considered

- **Adopt Supabase Auth now.** Rejected for v1: it would introduce a second
  identity store and a provider dependency before the platform needs it, and
  the current implementation already meets the functional requirements. The
  adapter boundary keeps the option open.
- **Auth.js as §140.24 suggests.** Rejected: it targets cookie sessions for
  Next.js apps; the API is a separate NestJS service and opaque tokens are a
  better fit for that split.
- **Rolling our own crypto.** Never: §140.24 forbids it. Only standard,
  audited primitives (`bcryptjs`, `node:crypto` randomness) are used.

## Consequences

- Positive: no third-party identity dependency; revocation is immediate.
- Negative: MFA, password recovery, and Argon2id migration remain outstanding
  and are tracked in the assessment.
