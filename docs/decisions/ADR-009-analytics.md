# ADR-009: Analytics

Status: Accepted
Spec references: §42, §140.30, §140.60, §143.27

## Context

§42 requires real analytics or an honest "unavailable" state — never fabricated
numbers. §143.27 requires analytics to be independent of core functionality so
a provider outage cannot take the site down.

## Decision

Analytics is a client-side, provider-abstracted, opt-in layer.

- `AnalyticsService` wraps a provider; the public site calls the service, never
  the provider script directly (§140.60).
- The default provider is Plausible, loaded only when
  `NEXT_PUBLIC_ANALYTICS_DOMAIN` is configured and the admin has enabled
  analytics in site settings. If it is unset, no script loads and no data is
  collected (§143.31).
- The admin dashboard shows only metrics the system can actually compute from
  its own database. Where a metric requires an analytics provider that is not
  configured, the UI says so rather than inventing a value (§42, §66).
- No visitor personal data is stored by the application (§140.30).

## Alternatives considered

- **Google Analytics.** Rejected: heavier, more privacy-invasive, and §140.30
  prefers a privacy-conscious provider.
- **Self-hosted analytics now.** Deferred by §93.
- **Server-side analytics counters.** Deferred: they add write load and a
  privacy surface for little value at this scale.

## Consequences

- Positive: privacy-respecting, failure-isolated, honest empty states.
- Negative: no analytics data until a provider domain is configured.
