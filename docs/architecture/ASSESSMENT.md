# Architecture Assessment

Status: current as of this implementation pass.
Authoritative specification: `docs/specs/GENERAL-PORTFOLIO-WEBSITE-MASTER-PROMPT.docx`
and `docs/specs/140-CONCRETE-IMPLEMENTATION-STACK.docx`.

This document is Phase 2 of the AI coding agent workflow (§127): inspect the
repository, then record what exists, what is missing, and how the gaps will be
closed. It is the baseline that every later change is measured against.

## 1. Repository shape

Typed pnpm + Turborepo monorepo, matching §140.36:

```
apps/
  web/      Next.js 15 public website        (port 3000)
  admin/    Next.js 15 Super Admin portal    (port 3002)
  api/      NestJS 11 REST API, prefix /api  (port 3001)
packages/
  api-client/  typed HTTP client shared by web + admin
  config/      environment loading + validation
  types/       shared domain types
  ui/          design tokens + primitives
  utils/       small shared helpers
  validation/  Zod schemas shared by API + frontends
prisma/          schema, migrations, seed
docs/            architecture, ADRs, API, security, deployment
```

## 2. Technology conformance (§140, §143)

| Concern | Required | Present | Notes |
| --- | --- | --- | --- |
| Language | TypeScript | yes | strict mode in `tsconfig.base.json` |
| Public web | Next.js App Router | yes | server components + typed API client |
| Admin | Next.js | yes | client-authenticated SPA over the API |
| Backend | NestJS | yes | modular monolith, domain modules |
| Database | PostgreSQL | yes | via Prisma |
| ORM | Prisma | yes | migrations committed |
| Validation | Zod | yes | `@portfolio/validation`, reused both sides |
| Styling | Tailwind CSS | yes | design tokens in `@portfolio/ui` |
| UI components | shadcn-style | partial | primitives exist, not all pages use them |
| Icons | Lucide | yes | |
| Auth | opaque session tokens | yes | bcrypt hashes, revocable sessions |
| Rate limiting | yes | yes | `@nestjs/throttler` |
| Security headers | yes | yes | helmet |
| Structured logging | Pino | yes | |
| OpenAPI | yes | yes | Swagger at `/api/docs` |
| Tests | Vitest + Playwright | partial | Vitest suites in `api` (23) and `utils` (8); no web/admin runner; no e2e package yet |
| Lint | ESLint 9 | yes | root flat config; `pnpm lint` green (9/9) |
| CI/CD | GitHub Actions | yes | `.github/workflows/ci.yml` with a Postgres service container |
| Local infra | Docker compose | yes | `docker-compose.yml`: PostgreSQL, Redis, MinIO, Mailpit |

## 3. What already works (verified)

- Prisma schema covering identity, time-aware entities, publications,
  articles, revisions, media, contact, navigation, SEO, settings, auth,
  audit, backups, integrations.
- Migration applied and seed executed against PostgreSQL 16.
- Admin authentication: bcrypt login, opaque session tokens, revocation,
  account lockout fields, failed-login audit, change-password.
- Public read API with visibility enforcement (`PUBLIC` only) plus a
  contact submission endpoint with a honeypot.
- Admin API: CRUD for all content entities, article publish/schedule,
  media upload, contact status, navigation, settings, SEO, audit list,
  dashboard counts.
- Public web pages for home, about, education, experience, research,
  projects (list + detail), publications, articles (list + detail), skills,
  contact.
- Admin portal: login, dashboard, generic entity manager, settings, audit.
- `pnpm typecheck` passes across all nine workspaces.

## 4. Gaps against the specification

These are the concrete, functional gaps. Each is either fixed in this pass or
explicitly recorded as out of scope for v1.

### 4.1 Broken or non-functional public features

- **Navigation is hardcoded and points at a page that does not exist.**
  `apps/web/src/components/site-header.tsx` hardcodes links including
  `/achievements`, but no `apps/web/src/app/achievements/page.tsx` exists, so
  the link 404s. The seeded `NavItem` records in the database are never read
  by the public site, so the Super Admin cannot actually control navigation
  (§6, §109). This violates the "no fake functionality" rule (§4).
- **No public search UI.** The API exposes `/public/search` and the client
  exposes `getPublic.search`, but no page consumes it (§17, §133).
- **No sitemap, robots, or JSON-LD structured data** (§26, §65, §140.65–67).
- **Article body is rendered as preformatted plain text.** There is no rich
  text editor, no sanitization, and no revision UI (§13, §14, §140.18, §140.71).
- **Empty-state copy implies the CMS is not connected** ("once the site is
  connected to its CMS") even though it is. §79 requires intentional empty
  states, not misleading ones.

### 4.2 Missing admin capabilities

- **No article editor.** `entity-manager.tsx` has no `articles` field
  definition, so `/content/articles` renders an empty form and cannot create
  or edit articles. Publishing (Journey 3, §65) is therefore not achievable
  from the UI.
- **No media library UI.** `uploadMedia` exists in the API but no page uploads
  or lists media; `/content/media` routes into the generic manager which has
  no `media` field definition (§15).
- **No profile editor.** `/content/profile` routes into the generic manager,
  which has no `profile` definition (§8, §88).
- **No inbox UI.** `/content/contact` routes into the generic manager; there
  is no status workflow view for submissions (§43).
- **No SEO, navigation, or social-link management UI** (§22, §109, §110).
- **No change-password or MFA UI**, though the API supports change-password
  and the schema reserves MFA fields (§34, §140.28).
- **No preview of unpublished content** (§84).
- **Media upload is local-disk only.** `uploadMedia` writes to a local
  `/media` path with no storage adapter, no MIME/size validation, and no
  private/public separation (§37, §140.22, §140.58, §143.20).
- **Media cannot be deleted** through the API even though the client exposes
  `remove` (§140.73 requires audited deletion).

### 4.3 Missing infrastructure and quality gates

- No tests at any level (§64, §140.34).
- No CI pipeline (§63, §140.48).
- No `docker-compose.yml` for local PostgreSQL/Redis/MinIO/Mailpit (§140.40–42).
- No health `live`/`ready` split and readiness does not check dependencies
  beyond the database (§140.76).
- No scheduled-publishing worker; `SCHEDULED` articles never transition to
  `PUBLISHED` (§85, §143.37).
- No email adapter; the contact endpoint has a comment where a notification
  would go (§117, §140.29).
- No cache invalidation strategy; public reads always hit the database
  (§54, §83).
- No audit of `before` state on updates (`updateEntity` passes `undefined`).
- `resolveModel`/`createEntity` maps omit `social-links` and `nav-items` for
  updates/deletes, so those records cannot be edited individually.

### 4.4 Deliberately deferred (recorded, not built)

Per §93 (no unnecessary complexity) and §123 (MVP definition), the following
remain documented but unimplemented for v1:

- External integrations (GitHub, ORCID, Scholar, LinkedIn) — adapter
  interfaces only.
- Analytics provider wiring (Plausible) — the settings flag exists.
- Backup execution — `BackupRecord` model exists; no scheduler.
- AI assistant and MCP tooling (§96–98).
- Internationalization (§49).
- Terraform (§140.47).

## 5. Conflicts with the specification to resolve

1. **§143 mandates Supabase Auth for the admin.** The repository implements
   opaque bearer sessions with bcrypt instead. §143.15 permits this only if
   provider-specific logic is isolated behind an application interface. The
   existing implementation is secure and working, so it is retained and the
   divergence is recorded in ADR-004 rather than rewritten. Supabase remains
   the recommended database/storage provider (ADR-003, ADR-005).
2. **§140.27 prefers Argon2id; the code uses bcrypt.** `argon2` is already a
   dependency. ADR-004 records bcrypt as the current hash and Argon2id as the
   forward path.
3. **§140.24 suggests Auth.js; the code uses first-party sessions.** Same ADR.

## 6. Fix plan for this pass

Ordered by dependency, following §127 (foundations before decoration):

1. Environment + baseline verification. Done.
2. Architecture documentation and ADRs. Done in this directory.
3. Fix broken public navigation; drive header/footer from the API.
4. Add the missing `/achievements` page and align navigation with seeded data.
5. Public search UI.
6. Sitemap, robots, JSON-LD.
7. Storage adapter + hardened, validated media upload.
8. Article editor with sanitization and revisions.
9. Media library, profile, inbox, SEO, navigation admin screens.
10. Email adapter and scheduled-publishing worker.
11. Tests and CI.
12. Local Docker infrastructure.

## 7. Verification discipline

Every claim in this document was checked against the source tree and, where
runtime behaviour is involved, against a running PostgreSQL instance with
migrations applied and the seed executed. §131 forbids reporting success that
was not observed; this pass reports only what was actually run.

## 8. Status update (later pass)

Sections 4.1–4.3 above were the gaps at the time this assessment was first
written. The following have since been closed and verified at runtime:

- Public navigation is driven from the API, with a documented fallback (§109).
- `/achievements`, `/search`, `sitemap.xml`, `robots.txt`, and JSON-LD exist.
- Article editor with safe markdown rendering and revisions in the admin.
- Media library, profile, inbox, SEO, navigation, and security admin screens.
- Storage abstraction with public/private separation and signed private URLs
  (§140.54, §143.22). The private download endpoint rejects unsigned requests.
- Scheduled publishing worker transitions due `SCHEDULED` articles (§143.37).
- Email adapters with console, SMTP (Mailpit locally), and Resend providers;
  the contact workflow persists and notifies best-effort (§43, §143.36).
- `health/live`, `health/ready`, and `health/status` (§140.76).
- Vitest suites for the API and `@portfolio/utils`.
- CI workflow (`.github/workflows/ci.yml`) with a Postgres service container
  (§63, §140.48) and `docker-compose.yml` for local PostgreSQL, Redis, MinIO,
  and Mailpit (§140.40–42).
- ESLint 9 flat config at the repo root; `pnpm lint` is green across all nine
  workspaces and gates CI.

Still open, recorded rather than built (§93, §123):

- No browser-level end-to-end suite; web and admin are verified by running the
  dev servers and exercising routes.
- External integrations (GitHub, ORCID, Scholar, LinkedIn) remain adapter
  interfaces only; analytics, backup execution, AI assistant, i18n, and
  Terraform remain deferred per §4.4.

Fixes made in this pass:

- **Lint was never functional.** ESLint 9 was installed with no flat config, so
  every `pnpm lint` failed and the mandated CI lint gate could not pass. Added a
  root `eslint.config.mjs` (typescript-eslint + `@next/next`) and removed the
  dead imports it surfaced.
- **Fabricated content removed.** Manual verification had left a `Test Owner`
  profile, an example GitHub social link, a draft article, and a test upload in
  the database. These violated §80/§81 and were purged; the seed only writes
  system configuration and the single Super Admin.
- **Media wildcard routes.** `@Get('public/*key')` / `@Get('private/*key')` are
  invalid under Express 4 path-to-regexp. Changed to `@Get('public/*')` and
  `@Get('private/*')` reading `req.params[0]`, with a regression suite in
  `apps/api/src/media/media.controller.spec.ts`.
- **Honeypot.** `contactSubmissionSchema.website` was capped at 10 characters,
  so a bot's URL failed validation with a 400 that revealed the trap. Raised the
  cap and made a filled honeypot return the same `{ received: true }` shape as a
  real submission while persisting nothing (§140.53).
- **Single Super Admin.** Enforced by a partial unique index and a role-based,
  reconciling seed (ADR-012, §6).

