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
    orderBy: {
      createAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      profilePhoto: true,
      contactNumber: true,
      registrationNumber: true,
      experience: true,
      gender: true,
      appointmentFee: true,
      qualification: true,
      currentWorkingPlace: true,
      designation: true,
      avaerageRating: true,
      createAt: true,
      updatedAt: true,
      specialities: {
        select: {
          speciality: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  // Transform specialties (flatten structure)
  const doctors = result.map((doctor) => ({
    ...doctor,
    specialities: doctor?.specialities.map((s) => s.speciality),
  }));
  console.log("doctors", doctors);
  return doctors;
};

const getDoctorById = async (id: string) => {
  const result = await prisma.doctor.findUnique({
    where: { id: id },
    select: {
      id: true,
      name: true,
      email: true,
      profilePhoto: true,
      contactNumber: true,
      registrationNumber: true,
      experience: true,
      gender: true,
      appointmentFee: true,
      qualification: true,
      currentWorkingPlace: true,
      designation: true,
      avaerageRating: true,
      createAt: true,
      updatedAt: true,
      userId: true,
      specialities: {
        select: {
          speciality: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  return result;
};

const updateDoctor = async (id: string, payload: TUpdateDoctorPayload) => {
  const { specialities, userId, ...doctorData } = payload;
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
  const result = await prisma.$transaction(async (tx) => {
    //update doctor data
    await tx.doctor.update({
      where: { id: id },
      data: doctorData,
    });
    //update into user
    const userUpdateData: any = {};

    if (payload.name) userUpdateData.name = payload.name;
    if (payload.email) userUpdateData.email = payload.email;
    if (payload.profilePhoto) userUpdateData.image = payload.profilePhoto;
    console.log("userId", payload?.userId);
    console.log(
      "exist user",
      await tx.user.findUnique({ where: { id: payload?.userId } })
    );
    await tx.user.update({
      where: { id: payload?.userId },
      data: userUpdateData,
    });

    //update specialites if it's exist
    if (specialities && specialities.length > 0) {
      await tx.doctorSpeciality.deleteMany({ where: { doctorId: id } });

      const doctorSpecialityPayload = specialities?.map((speciality) => {
        return {
          doctorId: id,
          specialityId: speciality,
        };
      });
      await tx.doctorSpeciality.createMany({ data: doctorSpecialityPayload });
    }

    return await tx.doctor.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        contactNumber: true,
        registrationNumber: true,
        experience: true,
        gender: true,
        appointmentFee: true,
        qualification: true,
        currentWorkingPlace: true,
        designation: true,
        avaerageRating: true,
        createAt: true,
        updatedAt: true,
        user: true,
        specialities: {
          select: {
            speciality: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });
  });
  return result;
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
      const result = await prisma.$transaction(async (tx) => {
        return await tx.user.update({
          where: { id: softDeleteDoctor?.userId },
          data: { isDeleted: true, deletedAt: new Date() },
        });
      });
      return { ...result, user: { ...softDeleteDoctor } };
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
