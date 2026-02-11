import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import type { adminWhereInput } from "../../../generated/prisma/models";
import { AppError } from "../../errorHelplers/appError";
import { prisma } from "../../lib/prisma";
import type { IAdminFilterRequest,  TUpdateAdminPayload } from "./admin.interface";

const getAllAdmin = async (searchQuery: IAdminFilterRequest) => {
  const anyConditions: adminWhereInput[] = [];
  if (searchQuery?.email) {
    anyConditions.push({ email: searchQuery?.email });
  }

  if (searchQuery?.isDeleted) {
    anyConditions.push({ isDeleted: searchQuery?.isDeleted });
  }
  const admin = await prisma.admin.findMany({
    where: { AND: anyConditions },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      name: true,
      email: true,
      contactNumber: true,
      profilePhoto: true,
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

  return admin;
};
const getAdminById = async (id: string) => {
  const admin = await prisma.admin.findFirst({
    where: { id: id, isDeletedAt: false },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      name: true,
      email: true,
      contactNumber: true,
      profilePhoto: true,
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

  return admin;
};
const updateAdmin=async(id:string,payload:TUpdateAdminPayload)=>{
    const existAdmin = await prisma.admin.findFirst({
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
    if (!existAdmin) {
        throw new AppError(
          status.FORBIDDEN,
          "Forbidden User. Doctor doesn't exist here"
        );
       
      }
 const updateAdmin=await prisma.admin.update({
        where:{
            id:id
        },
        data:payload
    });
    try{
     if(updateAdmin?.id){
        const result=await prisma.$transaction(async(tx)=>{
            const userUpdateData: any = {};

            if (payload.name) userUpdateData.name = payload.name;
            if (payload.email) userUpdateData.email = payload.email;
            console.log(
              "exist user",
              await tx.user.findUnique({ where: { id: payload?.userId } })
            );
           return   await tx.user.update({
              where: { id: payload?.userId },
              data: userUpdateData,
            });     
        })
        return {...updateAdmin,user:{...result}};
   
    }

}
    catch(error:any){
        throw new Error(error?.message)
    }
}

const deleteAdmin = async (id: string) => {
    const existAdmin = await prisma.admin.findFirst({
      where: {
        id: id,
        isDeleted: false,
        user: { status: UserStatus?.ACTIVE, isDeleted: false },
      },
      include: { user: true },
    });
    if (!existAdmin) {
      throw new AppError(
        status.FORBIDDEN,
        "Forbidden User. Doctor doesn't exist here"
      );
    }
    const softDeleteAdmin = await prisma.admin.update({
      where: { id: id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
    try {
      if (softDeleteAdmin?.id) {
        const result = await prisma.$transaction(async (tx) => {
          return await tx.user.update({
            where: { id: softDeleteAdmin?.userId },
            data: { isDeleted: true, deletedAt: new Date() },
          });
        });
        return { ...result, user: { ...softDeleteAdmin } };
      }
    } catch (error: any) {
      await prisma.admin.update({
        where: { id: id },
        data: { isDeleted: true },
      });
      return null;
    }
  };

export const adminService = { getAllAdmin, getAdminById ,updateAdmin,deleteAdmin};
