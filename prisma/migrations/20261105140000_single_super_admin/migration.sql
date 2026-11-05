-- §6 Single Super Admin Principle.
-- Exactly one SUPER_ADMIN may exist at any time. A partial unique index on the
-- role column enforces this in the database itself, so no application code path
-- can create a second one even by mistake.
CREATE UNIQUE INDEX "AdminUser_single_super_admin_key"
  ON "AdminUser" ("role")
  WHERE "role" = 'SUPER_ADMIN';
