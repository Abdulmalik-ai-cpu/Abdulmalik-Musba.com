# ADR-008: External integrations

Status: Accepted
Spec references: §30, §31, §140.61–140.64, §143.41

## Context

GitHub, ORCID, Google Scholar, LinkedIn, email, analytics, and storage are all
external services the platform may use. §31 is explicit that the portfolio core
owns canonical data and external services are sources or destinations. §143.41
requires that a failed optional integration never breaks core functionality.

## Decision

Every external service sits behind an adapter interface. Core domain code
depends on the interface, never on a provider SDK.

- `EmailService` → `ResendEmailAdapter`, `ConsoleEmailAdapter` (dev). §140.59.
- `StorageService` → `S3StorageAdapter`, `LocalStorageAdapter`. ADR-005.
- `AnalyticsService` → `PlausibleAdapter`. ADR-009.
- `IntegrationService` → GitHub, ORCID, Scholar, LinkedIn adapters (§140.61).

Rules:

1. Imported external data is reviewable before it becomes canonical (§140.63).
2. The public site never requires an external service to render (§140.62,
   §143.41).
3. The email adapter distinguishes "accepted by provider" from "delivered"
   and never claims delivery without provider evidence (§140.29, §131).

For v1 only the email and storage adapters are implemented; the integration
adapters are interfaces with no consumers yet, because §99 says to implement
only interfaces that have real consumers.

## Alternatives considered

- **Call provider SDKs directly from services.** Rejected: it embeds provider
  assumptions and makes failure isolation impossible.
- **Build all adapters now.** Rejected by §93 and §99.

## Consequences

- Positive: provider swap is a configuration change; integrations cannot take
  the site down.
- Negative: one extra indirection per external service.
