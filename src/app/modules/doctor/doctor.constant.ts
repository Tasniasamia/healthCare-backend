import type { Prisma } from "../../../generated/prisma/client";

export const doctorSearchableFields = [
  "name",
  "email",
  "qualification",
  "designation",
  "currentWorkingPlace",
  "registrationNumber",
  "specialties.specialty.title",
];

export const doctorFilterableFields = [
  "gender",
  "isDeleted",
  "appointmentFee",
  "experience",
  "registrationNumber",
  "specialties.specialtyId",
  "currentWorkingPlace",
  "designation",
  "qualification",
  "specialties.specialty.title",
  "user.role",
];


export const createdoctorConfig : Partial<Record<keyof Prisma.DoctorSchedulesInclude,  Prisma.DoctorSchedulesInclude[keyof Prisma.DoctorSchedulesInclude]>> ={
  doctor: {
      include: {
          appointments: true,
      }
  },
  schedule: true

}
