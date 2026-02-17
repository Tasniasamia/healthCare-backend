import status from "http-status";
import { AppError } from "../../errorHelplers/appError";
import { prisma } from "../../lib/prisma";
import type { TUpdateDoctorPayload } from "./doctor.interface";
import { Role, UserStatus } from "../../../generated/prisma/enums";

const getAllDoctor = async () => {
  const result = await prisma.doctor.findMany({
    where: {
      isDeleted: false,
    
    
      
    },
    include: {
      user: true,
      specialities: {
        include: {
          specialty: true,
        },
      },
    },
  });

  return result;
};

const getDoctorById = async (id: string) => {
  const result = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      user: true,
      specialities: {
        include: {
          specialty: true,
        },
      },
      appointments: {
        include: {
          patient: true,
          schedule: true,
          prescription: true,
        },
      },
      doctorSchedules: {
        include: {
          schedule: true,
        },
      },
      reviews: true,
    },
  });

  return result;
};

const updateDoctor = async (id: string, payload: TUpdateDoctorPayload) => {
  const { specialities, ...doctorData } = payload;

  const existDoctor = await prisma.doctor.findFirst({
    where: {
      id,
      isDeleted: false,
      user: {
        status: UserStatus.ACTIVE,
      },
    },
    include: {
      user: true,
    },
  });

  if (!existDoctor) {
    throw new AppError(
      status.FORBIDDEN,
      "Forbidden User. Doctor doesn't exist here"
    );
  }
  await prisma.$transaction(async (tx) => {
    //update doctor data
    await tx.doctor.update({
      where: { id: id },
      data: doctorData,
    });

    // //update specialites if it's exist
    if (specialities && specialities.length > 0) {
      for (let speciality of specialities) {
        console.log("speciality", speciality);

        if (speciality?.shouldDelete) {
          await tx.doctorSpecialty.delete({
            where: {
              doctorId_specialtyId: {
                doctorId: id,
                specialtyId: speciality?.specilitiesId,
              },
            },
          });
        } else {
          await tx.doctorSpecialty.upsert({
            where: {
              doctorId_specialtyId: {
                doctorId: id,
                specialtyId: speciality?.specilitiesId,
              },
            },
            update: {},
            create: {
              doctorId: id,
              specialtyId: speciality?.specilitiesId,
            },
          });
        }
      }
    }
  });
  const doctor = await getDoctorById(id);
  return doctor;
};

const deleteDoctor = async (id: string) => {
  const existDoctor = await prisma.doctor.findFirst({
    where: {
      id: id,
      isDeleted: false,
      user: { status: UserStatus?.ACTIVE, isDeleted: false },
    },
    include: { user: true },
  });
  if (!existDoctor) {
    throw new AppError(
      status.FORBIDDEN,
      "Forbidden User. Doctor doesn't exist here"
    );
  }
  const softDeleteDoctor = await prisma.doctor.update({
    where: { id: id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
  try {
    if (softDeleteDoctor?.id) {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: softDeleteDoctor?.userId },
          data: {
            isDeleted: true,
            status: UserStatus.DELETED,
            deletedAt: new Date(),
          },
        });
        await tx.doctorSpecialty.deleteMany({
          where: { doctorId: softDeleteDoctor?.id },
        });
      });

      return softDeleteDoctor;
    }
  } catch (error: any) {
    await prisma.doctor.update({
      where: { id: id },
      data: { isDeleted: true },
    });
    return null;
  }
};

export const doctorService = {
  getAllDoctor,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};
