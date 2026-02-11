/*
  Warnings:

  - You are about to drop the column `role` on the `admin` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `admin` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `superAdmin` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `superAdmin` table. All the data in the column will be lost.
  - Added the required column `contactNumber` to the `admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactNumber` to the `superAdmin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "admin" DROP COLUMN "role",
DROP COLUMN "status",
ADD COLUMN     "contactNumber" TEXT NOT NULL,
ADD COLUMN     "profilePhoto" TEXT;

-- AlterTable
ALTER TABLE "superAdmin" DROP COLUMN "role",
DROP COLUMN "status",
ADD COLUMN     "contactNumber" TEXT NOT NULL,
ADD COLUMN     "profilePhoto" TEXT;
