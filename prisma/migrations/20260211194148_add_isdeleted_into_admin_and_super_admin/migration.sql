-- AlterTable
ALTER TABLE "admin" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeletedAt" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "superAdmin" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeletedAt" BOOLEAN NOT NULL DEFAULT false;
