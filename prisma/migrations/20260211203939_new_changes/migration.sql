/*
  Warnings:

  - You are about to drop the column `isDeletedAt` on the `admin` table. All the data in the column will be lost.
  - You are about to drop the column `isDeletedAt` on the `superAdmin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "admin" DROP COLUMN "isDeletedAt",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "superAdmin" DROP COLUMN "isDeletedAt",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "admin_email" ON "admin"("email");

-- CreateIndex
CREATE INDEX "admin_isDeleted" ON "admin"("isDeleted");

-- CreateIndex
CREATE INDEX "superAdmin_email" ON "superAdmin"("email");

-- CreateIndex
CREATE INDEX "superAdmin_isDeleted" ON "superAdmin"("isDeleted");
