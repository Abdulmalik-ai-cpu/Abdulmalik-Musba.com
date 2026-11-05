-- AlterEnum
BEGIN;
CREATE TYPE "ContactStatus_new" AS ENUM ('NEW', 'READ', 'IN_PROGRESS', 'RESPONDED', 'ARCHIVED', 'SPAM');
ALTER TABLE "public"."ContactSubmission" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ContactSubmission" ALTER COLUMN "status" TYPE "ContactStatus_new" USING ("status"::text::"ContactStatus_new");
ALTER TYPE "ContactStatus" RENAME TO "ContactStatus_old";
ALTER TYPE "ContactStatus_new" RENAME TO "ContactStatus";
DROP TYPE "public"."ContactStatus_old";
ALTER TABLE "ContactSubmission" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- AlterTable
ALTER TABLE "ContactSubmission" ADD COLUMN     "notificationError" TEXT,
ADD COLUMN     "notifiedAt" TIMESTAMP(3),
ADD COLUMN     "organization" TEXT;

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "articleId" TEXT,
ADD COLUMN     "checksum" TEXT,
ADD COLUMN     "storageKey" TEXT;

-- CreateIndex
CREATE INDEX "Article_status_scheduledFor_idx" ON "Article"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "Article_visibility_status_idx" ON "Article"("visibility", "status");

-- CreateIndex
CREATE INDEX "ContactSubmission_status_idx" ON "ContactSubmission"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Media_storageKey_key" ON "Media"("storageKey");

-- CreateIndex
CREATE INDEX "Media_storageClass_idx" ON "Media"("storageClass");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

