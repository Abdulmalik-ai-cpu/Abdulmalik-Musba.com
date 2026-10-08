# Abdulmalik Musba — Portfolio Platform

Typed monorepo: a public portfolio site, a super-admin portal, and a REST API,
with a shared Prisma database.

## Stack

| Layer | Technology |
| --- | --- |
| Public site | Next.js 15 (`apps/web`, port 3000) |
| Admin portal | Next.js 15 (`apps/admin`, port 3002) |
| API | NestJS 11 (`apps/api`, port 3001, prefix `/api`) |
| Database | PostgreSQL |
| ORM | Prisma (`prisma/schema.prisma`) |
| Auth | Opaque bearer tokens (`AuthSession`) + bcrypt password hashes |
| Package manager | pnpm workspaces + Turborepo |

## Fresh setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env
#   Set DATABASE_URL, and optionally ADMIN_EMAIL / ADMIN_PASSWORD.
#   If ADMIN_PASSWORD is unset the seed generates a strong password and prints it once.

# 3. Start PostgreSQL (any local instance works), e.g. with Docker:
#    docker run -d --name portfolio-pg -p 5432:5432 \
#      -e POSTGRES_USER=portfolio -e POSTGRES_PASSWORD=portfolio_dev_password \
#      -e POSTGRES_DB=portfolio_dev postgres:16

# 4. Apply migrations
pnpm db:deploy

# 5. Seed the super admin (idempotent — safe to run repeatedly)
pnpm db:seed

# 6. Start everything (web :3000, api :3001, admin :3002)
pnpm dev
```

Then open:

- Public site — http://localhost:3000
- Admin portal — http://localhost:3002/login

Log in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you configured.

## Useful scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run web, API, and admin in watch mode |
| `pnpm build` | Production build of all workspaces |
| `pnpm typecheck` | Type-check every workspace |
| `pnpm lint` | Lint every workspace |
| `pnpm db:migrate` | Create/apply a migration in development |
| `pnpm db:deploy` | Apply committed migrations |
| `pnpm db:seed` | Seed the super admin (idempotent) |
| `pnpm db:studio` | Open Prisma Studio |

## Admin authentication

- Credentials are configured through `ADMIN_EMAIL` / `ADMIN_PASSWORD` and
  stored as a bcrypt hash in the `AdminUser` table. Plaintext passwords are
  never stored.
- Login issues an opaque token persisted in `AuthSession`; the admin client
  sends it as a bearer token and validates the session on refresh.
- Logging out revokes the session server-side.

## Environment variables

See `.env.example` for the root variables and `apps/api/.env.example` for the
API. Never commit `.env` files — `.gitignore` excludes them.
