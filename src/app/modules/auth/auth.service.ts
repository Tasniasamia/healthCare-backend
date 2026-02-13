import status from "http-status";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../errorHelplers/appError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import type { JwtPayload } from "jsonwebtoken";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../../config/env";
import type { IJwtUserPayload } from "../../interfaces/token.interface";
import type { TChangePasswordPayload } from "./auth.interface";

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
    name: user?.name,
  };
  const accessToken = await tokenUtils.generateAccessToken(tokenPayload as JwtPayload);
  const refreshToken = await tokenUtils.generateRefreshToken(tokenPayload as JwtPayload);

  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError(status.FORBIDDEN, "User is blocked");
  }

  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError(status.NOT_FOUND, "User is deleted");
  }

  return { data, accessToken, refreshToken, token };
};

const getProfile = async (user: JwtPayload) => {
  const findUser = await prisma.user.findFirst({
    where: { id: user?.id, isDeleted: false },
    include: {
      patient: {
        include: {
          appointments: true,
          medicalReports: true,
          patientHealthData: true,
          prescriptions: true,
          reviews: true,
        },
      },
      doctor: {
        include: {
          appointments: true,
          doctorSchedules: true,
          prescriptions: true,
          specialities: true,
          reviews: true,
        },
      },
      admin: true,
      superAdmin: true,
    },
  });
  if (!findUser) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthrozied Access. You are not athorized here"
    );
  }
  return findUser;
};

const getNewToken = async (refreshToken: string, sessionToken: string) => {

  const verifyRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    envVars.REFRESH_TOKEN_SECRET
  );
  if (!verifyRefreshToken?.success) {
    throw new AppError(
      status.BAD_REQUEST,
      verifyRefreshToken?.message as string
    );
  }

  const user = verifyRefreshToken.data as JwtPayload;
 

  console.log("user",user);
  const accessTokenNew = await tokenUtils.generateAccessToken(
    {
      email:user?.email,
      role: user?.role,
      id: user?.id,
      status: user?.status,
      isDeleted: user?.isDeleted,
      name: user?.name,
    } 
  );
  const refreshTokenNew = await tokenUtils.generateRefreshToken(
    {
      email: user?.email ,
      role: user?.role,
      id: user?.id,
      status: user?.status,
      isDeleted: user?.isDeleted,
      name: user?.name,
    } 
  );
  // console.log("accessTokenNew", accessTokenNew);

  const sessionExist = await prisma.session.findFirst({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });
  console.log("sessionExist", sessionExist);

  if (!sessionExist) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized Access. You are not authenticate here"
    );
  }

  const sessionTokenExpirationUpdate = await prisma.session.update({
    where: { token: sessionToken },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000 * 24),
      updatedAt: new Date(),
    },
  });
  console.log("sessionTokenExpirationUpdate", sessionTokenExpirationUpdate);
  if (sessionTokenExpirationUpdate) {
    return {
      accessToken:  accessTokenNew,
      refreshToken: refreshTokenNew,
      token: sessionToken,
    };
  }

  return null;
};

const changePassword=async(payload:TChangePasswordPayload,sessionToken:string)=>{
  console.log("payload",payload);
  const session = await auth.api.getSession({
    headers : new Headers({
        Authorization : `Bearer ${sessionToken}`
    })
})

if(!session){
    throw new AppError(status.UNAUTHORIZED, "Invalid session token");
}
  const data = await auth.api.changePassword({
    body: {
        newPassword: payload?.newPassword, 
        currentPassword: payload?.currentPassword,
        revokeOtherSessions: true,
    },
    
    headers: new Headers({
      Authorization : `Bearer ${sessionToken}`

    }),

});
if(session.user.needPasswordChanges){
  await prisma.user.update({
      where: {
          id: session.user.id,
      },
      data: {
        needPasswordChanges: false,
      }
  })
}
const tokenPayload = {
  email: data?.user?.email,
  role: data?.user?.role,
  id: data?.user?.id,
  status: data?.user?.status,
  isDeleted: data?.user?.isDeleted,
  name: data?.user?.name,
};
const accessToken = await tokenUtils.generateAccessToken(tokenPayload as JwtPayload);
const refreshToken = await tokenUtils.generateRefreshToken(tokenPayload as JwtPayload);

console.log("password data",data);
return  { data, accessToken, refreshToken, token :data?.token};
}
export const AuthService = {
  registerPatient,
  loginUser,
  getProfile,
  getNewToken,
  changePassword
};
