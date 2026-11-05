# AGENTS.md

Repository knowledge for AI agents working in this codebase.

## What this is

A lifelong personal portfolio platform: public Next.js site + Super Admin portal
+ NestJS API over one shared Prisma/PostgreSQL database.

Authoritative specs live in `docs/specs/`:
- `GENERAL-PORTFOLIO-WEBSITE-MASTER-PROMPT.docx` (~140 sections)
- `140-CONCRETE-IMPLEMENTATION-STACK.docx` (the concrete stack, §140–143)

Section references in code comments (`§6`, `§140.53`, `§143.37`) point at those
documents. Read the relevant section before changing behaviour it governs.

## Layout

```
apps/web      Next.js 15 public site          :3000
apps/admin    Next.js 15 Super Admin portal   :3002
apps/api      NestJS 10 REST API, /api prefix :3001
packages/     api-client, config, types, ui, utils, validation
prisma/       schema, migrations, seed
docs/         architecture assessment, ADRs, specs
```

## Commands

```bash
pnpm install
cp .env.example .env          # then set DATABASE_URL etc.
docker compose up -d          # local postgres + redis + minio + mailpit (§140.40–42)
pnpm db:deploy                # apply migrations
pnpm db:seed                  # idempotent; bootstraps the single super admin
pnpm dev                      # web + api + admin in watch mode

pnpm lint                     # eslint 9 flat config at the repo root
pnpm typecheck                # all 9 workspaces
pnpm test                     # vitest (api + utils)
pnpm build                    # turbo build
```

CI (`.github/workflows/ci.yml`) runs install → migrate → lint → typecheck →
test → build against a Postgres service container. Lint and the migration step
are hard gates, so keep `pnpm lint` green locally before pushing.

## Non-negotiable invariants

- **Exactly one Super Admin, ever (§6).** Enforced by a partial unique index
  `AdminUser_single_super_admin_key` plus a seed that reconciles by role, not
  email. Never add a code path that creates a second `SUPER_ADMIN`.
- **All public reads filter to `visibility: PUBLIC`.** Articles additionally
  require `status: PUBLISHED`. See `apps/api/src/public/public.service.ts`.
- **No fabricated content (§80, §81).** Never seed fake biography, social
  links, or professional history. Only the Super Admin creates real content.
- **No placeholder implementations (§130) and no fabricated success (§131).**
  If something is not built, say so; do not report unverified success.

## Gotchas learned the hard way

- **Express 4 wildcard routes must be bare `*`.** `@Get('public/*key')` does
  not work: path-to-regexp reads it as wildcard + literal `key`, so real keys
  404 and keys ending in `key` crash. Use `@Get('public/*')` and read
  `req.params[0]`. Regression test: `apps/api/src/media/media.controller.spec.ts`.
- **`packages/validation` resolves from `dist`, not `src`, for the API runtime
  and `nest build`.** After editing validators, run
  `pnpm --filter @portfolio/validation build` or restart the API, or the running
  process keeps the stale schema.
- **`pnpm test` only covers `@portfolio/api` and `@portfolio/utils`.** `web` and
  `admin` have no test runner; verify them by running the dev server and
  exercising routes.
- **Vitest path aliases** are declared in `apps/api/vitest.config.ts`; add new
  workspace aliases there when tests import a new package.
- **Email adapters are provider-neutral.** `EMAIL_PROVIDER=smtp` + `SMTP_HOST`
  points at Mailpit locally (`localhost:1025`) and at a real mail server in
  production. `console` is the default and never claims delivery.

## Verification discipline

Build/typecheck prove compilation, not runtime behaviour. For behaviour changes,
start the API against the local PostgreSQL container and exercise the real
endpoints with `curl` before claiming success.
