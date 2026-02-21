/*
  Warnings:

  - You are about to drop the column `createAt` on the `doctors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "doctors" DROP COLUMN "createAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
