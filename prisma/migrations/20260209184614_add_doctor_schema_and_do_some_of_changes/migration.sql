/*
  Warnings:

  - The primary key for the `patients` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `speciality` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('FEMALE', 'MALE', 'OTHER');

-- AlterTable
ALTER TABLE "patients" DROP CONSTRAINT "patients_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "patients_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "patients_id_seq";

-- AlterTable
ALTER TABLE "speciality" DROP CONSTRAINT "speciality_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "speciality_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "speciality_id_seq";

-- CreateTable
CREATE TABLE "doctors" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "contactNumber" TEXT,
    "address" TEXT,
    "registrationNumber" TEXT,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "gender" "Gender" NOT NULL,
    "appointmentFee" DOUBLE PRECISION NOT NULL,
    "qualification" TEXT,
    "currentWorkingPlace" TEXT,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctorSpeciality" (
    "id" TEXT NOT NULL,
    "specialityId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctorSpeciality_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "doctors_userId_key" ON "doctors"("userId");

-- CreateIndex
CREATE INDEX "doctors_email" ON "doctors"("email");

-- CreateIndex
CREATE INDEX "doctors_gender" ON "doctors"("gender");

-- CreateIndex
CREATE INDEX "doctorSpeciality_specialityId" ON "doctorSpeciality"("specialityId");

-- CreateIndex
CREATE INDEX "doctorSpeciality_doctorId" ON "doctorSpeciality"("doctorId");

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctorSpeciality" ADD CONSTRAINT "doctorSpeciality_specialityId_fkey" FOREIGN KEY ("specialityId") REFERENCES "speciality"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctorSpeciality" ADD CONSTRAINT "doctorSpeciality_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
