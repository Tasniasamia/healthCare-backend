import type { NextFunction } from "express";
import { Role, type Speciality } from "../../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import type {
  TCreateAdminPayload,
  TCreateDoctorPayload,
  TCreateSuperAdminPayload,
} from "./user.interface";
import { AppError } from "../../errorHelplers/appError";
import status from "http-status";

const createDoctor = async (payload: TCreateDoctorPayload) => {
  const specialities: Speciality[] = [];
  for (let specialityId of payload.specialities) {
    const findSpeciality = await prisma.speciality.findUnique({
      where: { id: specialityId },
    });
    if (!findSpeciality) {
      throw new Error(`specialityId ${specialityId} doesn't exist here`);
    }
    specialities.push(findSpeciality);
  }
  const isUserExist = await prisma.user.findUnique({
    where: { email: payload?.doctor?.email },
  });
  if (isUserExist) {
    throw new Error(`User already exist as a ${isUserExist?.role}`);
  }

  const createUser = await auth.api.signUpEmail({
    body: {
      name: payload?.doctor?.name as string,
      email: payload?.doctor?.email as string,
      password: payload?.password,
      needPasswordChanges: true,
      role: Role.DOCTOR,
    },
  });
  if (!createUser?.user?.id) {
    throw new Error("Failed to create doctor as user into user model");
  }
  try {
    const createDoctor = await prisma.$transaction(async (tx) => {
      return await tx.doctor.create({
        data: { ...payload?.doctor, userId: createUser?.user?.id },
      });
    });

    if (createDoctor?.id) {
      const createDoctorSpecialityPayload = specialities.map((speciality) => {
        return {
          doctorId: createDoctor?.id,
          specialityId: speciality?.id,
        };
      });
      const createDoctorSpeciality = await prisma.doctorSpeciality.createMany({
        data: createDoctorSpecialityPayload,
      });
      const findDoctorData = await prisma.doctor.findUnique({
        where: { id: createDoctor?.id },
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          appointmentFee: true,
          registrationNumber: true,
          avaerageRating: true,
          contactNumber: true,
          currentWorkingPlace: true,
          designation: true,
          specialities: true,
          user: true,
          profilePhoto: true,
          qualification: true,
          createAt: true,
          gender: true,
          experience: true,
        },
      });
      return findDoctorData;
    }
  } catch (error) {
    await prisma.user.delete({ where: { id: createUser?.user?.id as string } });
    return;
  }
};

const createAdmin = async (payload: TCreateAdminPayload) => {
  const { password, admin } = payload;

  const isUserExist = await prisma.user.findUnique({
    where: { email: admin?.email },
  });

  if (isUserExist) {
    throw new Error(`User already exist as a ${isUserExist?.role}`);
  }

  const createUser = await auth.api.signUpEmail({
    body: {
      name: admin?.name as string,
      email: admin?.email as string,
      password: password,
      needPasswordChanges: true,
      role: Role.ADMIN,
    },
  });

  if (!createUser?.user?.id) {
    throw new Error("Failed to create admin as user into user model");
  }
  try {
    const result = await prisma.$transaction(async (tx) => {
      const createAdmin = await tx.admin.create({
        data: { userId: createUser?.user?.id as string, ...admin },
      });
      return await tx.admin.findUnique({
        where: { id: createAdmin?.id },
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              status: true,
            },
          },
        },
      });
    });
    console.log("createAdmin", result);
    return result;
  } catch (error: any) {
    await prisma.user.delete({ where: { id: createUser?.user?.id } });
    return;
  }
};

const createSuperAdmin = async (payload: TCreateSuperAdminPayload) => {
  const { password, superAdmin } = payload;

  const isUserExist = await prisma.user.findUnique({
    where: { email: superAdmin?.email },
  });

  if (isUserExist) {
    throw new Error(`User already exist as a ${isUserExist?.role}`);
  }

  const createUser = await auth.api.signUpEmail({
    body: {
      name: superAdmin?.name as string,
      email: superAdmin?.email as string,
      password: password,
      needPasswordChanges: true,
      role: Role.SUPER_ADMIN,
    },
  });

  if (!createUser?.user?.id) {
    throw new Error("Failed to create super admin as user into user model");
  }
  try {
    const result = await prisma.$transaction(async (tx) => {
      const createSuperAdmin = await tx.superAdmin.create({
        data: { userId: createUser?.user?.id as string, ...superAdmin },
      });
      return await tx.superAdmin.findUnique({
        where: { id: createSuperAdmin?.id },
        include: { user: true },
      });
    });
    return result;
  } catch (error: any) {
    await prisma.user.delete({ where: { id: createUser?.user?.id } });
    return;
  }
};

export const userService = { createDoctor, createAdmin, createSuperAdmin };
