/*
  Warnings:

  - Added the required column `designation` to the `doctors` table without a default value. This is not possible if the table is not empty.
  - Made the column `qualification` on table `doctors` required. This step will fail if there are existing NULL values in that column.
  - Made the column `currentWorkingPlace` on table `doctors` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "doctors" ADD COLUMN     "avaerageRating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "designation" TEXT NOT NULL,
ALTER COLUMN "qualification" SET NOT NULL,
ALTER COLUMN "currentWorkingPlace" SET NOT NULL;
