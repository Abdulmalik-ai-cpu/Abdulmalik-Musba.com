-- ===========================================================================
-- Abdulmalik-Musba.com - Super Admin + default configuration seed
-- Mirrors prisma/seed.ts. Run AFTER supabase-schema.sql, in the Supabase
-- SQL Editor, against the SAME database.
--
-- BEFORE RUNNING: replace  <<<CHOOSE-A-STRONG-PASSWORD>>>  below with the
-- password you want to log in with. It is hashed by PostgreSQL's bcrypt
-- (pgcrypto `crypt(..., gen_salt('bf', 12))`) and only the hash is stored.
-- Never paste a real password you use elsewhere; this is a fresh admin secret.
--
-- The pgcrypto extension is enabled by Supabase by default. If your project
-- has it in the `extensions` schema, call `extensions.crypt(...)` instead.
-- ===========================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

-- 1. Default site settings (prisma/seed.ts -> SiteSetting id 'default')
INSERT INTO "SiteSetting" ("id","siteName","tagline","footerText","theme","updatedAt")
VALUES (
  'default',
  'Abdulmalik Musba',
  'Personal Portfolio & Digital Legacy Platform',
  '© {year} Abdulmalik Musba. Built for a lifetime of work.',
  'dark',
  now()
)
ON CONFLICT ("id") DO NOTHING;

-- 2. Default SEO configuration (prisma/seed.ts -> SeoConfig id 'default')
INSERT INTO "SeoConfig" ("id","siteTitle","description","keywords","updatedAt")
VALUES (
  'default',
  'Abdulmalik Musba — Personal Portfolio',
  'Personal portfolio, research, projects, publications, and writing by Abdulmalik Musba.',
  ARRAY['portfolio','research','engineering','writing'],
  now()
)
ON CONFLICT ("id") DO NOTHING;

-- 3. Default navigation (only when the table is empty, like the seed script)
INSERT INTO "NavItem" ("id","label","href","order","visible","isExternal","updatedAt")
SELECT gen_random_uuid()::text, v.label, v.href, v.ord, true, false, now()
FROM (VALUES
  ('Home','/',0),
  ('About','/about',1),
  ('Education','/education',2),
  ('Experience','/experience',3),
  ('Research','/research',4),
  ('Projects','/projects',5),
  ('Publications','/publications',6),
  ('Skills','/skills',7),
  ('Achievements','/achievements',8),
  ('Articles','/articles',9),
  ('Contact','/contact',10)
) AS v(label, href, ord)
WHERE NOT EXISTS (SELECT 1 FROM "NavItem");

-- 4. The single Super Admin (§6). Inserted only when none exists yet, so
--    re-running this block can never create a second SUPER_ADMIN. The partial
--    unique index "AdminUser_single_super_admin_key" is the second guard.
INSERT INTO "AdminUser" ("id","email","name","role","passwordHash","updatedAt")
SELECT
  gen_random_uuid()::text,
  'admin@abdulmalik-musba.com',
  'Admin',
  'SUPER_ADMIN',
  crypt('<<<CHOOSE-A-STRONG-PASSWORD>>>', gen_salt('bf', 12)),
  now()
WHERE NOT EXISTS (SELECT 1 FROM "AdminUser" WHERE "role" = 'SUPER_ADMIN');

COMMIT;

-- Verification (optional): exactly one SUPER_ADMIN, with a bcrypt hash.
SELECT "email", "role", left("passwordHash", 7) AS hash_prefix
FROM "AdminUser"
WHERE "role" = 'SUPER_ADMIN';
