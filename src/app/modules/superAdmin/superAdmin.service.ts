import status from "http-status";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../errorHelplers/appError";
import { prisma } from "../../lib/prisma";
import type { superAdminWhereInput } from "../../../generated/prisma/models";
import type { ISuperAdminFilterRequest, TUpdateSuperAdminPayload } from "./superAdmin.interface";
import type { JwtPayload } from "jsonwebtoken";

const getAllSuperAdmin = async (searchQuery: ISuperAdminFilterRequest) => {
  const anyConditions: superAdminWhereInput[] = [];
  if (searchQuery?.email) {
    anyConditions.push({ email: searchQuery?.email });
  }

  if (searchQuery?.isDeleted) {
    anyConditions.push({ isDeleted: searchQuery?.isDeleted });
  }
  const superAdmin = await prisma.superAdmin.findMany({
    where: { AND: anyConditions },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id:true,
      name: true,
      email: true,
      contactNumber: true,
      profilePhoto: true,
      userId:true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          name: true,
          email: true,
          emailVerified: true,
          isDeleted: true,
          createdAt: true,
          role: true,
        },
      },
    },
  });

  // Transform specialties (flatten structure)

  return superAdmin;
};
const getSuperAdminById = async (id: string) => {
  const superAdmin = await prisma.superAdmin.findFirst({
    where: { id: id, isDeleted: false },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id:true,
      name: true,
      email: true,
      contactNumber: true,
      profilePhoto: true,
      createdAt: true,
      updatedAt: true,
      userId:true,
      user: {
        select: {
          name: true,
          email: true,
          emailVerified: true,
          isDeleted: true,
          createdAt: true,
          role: true,
        },
      },
    },
  });

  return superAdmin;
};
const updateSuperAdmin=async(id:string,payload:TUpdateSuperAdminPayload)=>{
    const existSuperAdmin = await prisma.superAdmin.findFirst({
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
    if (!existSuperAdmin) {
        throw new AppError(
          status.FORBIDDEN,
          "Forbidden User. Super Admin doesn't exist here"
        );
       
      }
 const updateSuperAdmin=await prisma.superAdmin.update({
        where:{
            id:id
        },
        data:payload
    });
    try{
     if(updateSuperAdmin?.id){
        const result=await prisma.$transaction(async(tx)=>{
            const userUpdateData: any = {};

            if (payload.name) userUpdateData.name = payload.name;
            if (payload.email) userUpdateData.email = payload.email;
          
           return   await tx.user.update({
              where: { id: payload?.userId },
              data: userUpdateData,
            });     
        })
        return {...updateSuperAdmin,user:{...result}};
   
    }

}
    catch(error:any){
        throw new Error(error?.message)
    }
}

const deleteSuperAdmin = async (id: string) => {

    const existUser = await prisma.user.findFirst({
      where: {
        id: id,
        isDeleted: false,
        status: UserStatus?.ACTIVE}
     
    });
    if (!existUser) {
      throw new AppError(
        status.FORBIDDEN,
        "Forbidden User. User doesn't exist here"
      );
    }


   if(existUser?.role === Role.SUPER_ADMIN){
    throw new AppError(
      status.NOT_ACCEPTABLE,
      "You can't delete the SUPER ADMIN"
    )
   }

  const deletedUser = await prisma.user.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      status:UserStatus.DELETED
    },
  });
   try {

    const result = await prisma.$transaction(async (tx) => {

   

      if (deletedUser.role === Role.ADMIN) {
        await tx.admin.update({
          where: { userId: id },
          data: { isDeleted: true, deletedAt: new Date() },
        });
      }

      if (deletedUser.role === Role.PATIENT) {
        await tx.patient.update({
          where: { userId: id },
          data: { isDeleted: true, deletedAt: new Date() },
        });
      }

      if (deletedUser.role === Role.DOCTOR) {
        await tx.doctor.update({
          where: { userId: id },
          data: { isDeleted: true, deletedAt: new Date() },
        });
      }

      return deletedUser;
    });
     
    return result;

    } catch (error: any) {
      await prisma.user.update({
        where: { id: id },
        data: { isDeleted: true },
      });
      return null;
    }
  };

export const superAdminService = { getAllSuperAdmin, getSuperAdminById ,updateSuperAdmin,deleteSuperAdmin};
