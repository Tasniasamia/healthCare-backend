import status from "http-status";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../errorHelplers/appError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";

interface IRegisterPatientPayload {
  name: string;
  email: string;
  password: string;
}

const registerPatient = async (payload: IRegisterPatientPayload) => {
  const { name, email, password } = payload;

  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      needPasswordChanges: true,
      role: Role.PATIENT,
    },
  });

  if (!data.user) {
    throw new Error("Failed to register patient");
  }
  try {
    const patientTx = await prisma.$transaction(async (tx) => {
      return await tx.patient.create({
        data: { name: name, email: email, userId: data?.user?.id },
      });
    });
    return { ...data?.user, ...patientTx };
  } catch (error: any) {
    await prisma.user.delete({ where: { id: data?.user?.id } });
    throw error;
  }
};

interface ILoginUserPayload {
  email: string;
  password: string;
}

const loginUser = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;

  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  const { token, user } = data;
  const tokenPayload = {
    email: user?.email,
    role: user?.role,
    id: user?.id,
    status: user?.status,
    isDeleted: user?.isDeleted,
    name:user?.name,
    
  };
  const accessToken = await tokenUtils.generateAccessToken(tokenPayload);
  const refreshToken = await tokenUtils.generateRefreshToken(tokenPayload);

  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError(status.FORBIDDEN, "User is blocked");
  }

  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError(status.NOT_FOUND, "User is deleted");
  }

  return { data, accessToken, refreshToken, token };
};

export const AuthService = {
  registerPatient,
  loginUser,
};
