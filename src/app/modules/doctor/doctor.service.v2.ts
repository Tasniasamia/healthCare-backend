import status from "http-status";
import type { IQueryParams } from "../../interfaces/query.interface";
import { AppError } from "../../errorHelplers/appError";
import { prisma } from "../../lib/prisma";
import type { doctorOrderByWithRelationInput } from "../../../generated/prisma/models";
import type { Prisma } from "../../../generated/prisma/client";

export const getAllDoctorV2 = async (query: IQueryParams) => {
  try {
    //rule-1 pagination
    const page = Number(query?.page) || 1;
    const skip = (page - 1) * Number(query?.limit) || 0;
    const take = Number(query?.limit) || 10;

    //rule-2 sorting
    // const sortOrder = query.sortOrder ? query.sortOrder : "desc";
    // const sortBy = query.sortBy || "createdAt";
    // const searchFields = [
    //   "name",
    //   "email",
    //   "address",
    //   "gender",
    //   "appointmentFee",
    //   "specialities.specialty.title",
    //   "user.status",
    //   "doctorSchedules.isBooked"
    // ]

    // let orderBy: doctorOrderByWithRelationInput = {};
    // if (query?.sortBy) {
    //   if (sortBy.split(".").length === 3) {
        
    //     const [relation, subRelation, field] = sortBy.split(".");
    //     orderBy = {
    //       [relation as string]: {
    //         [subRelation as string]: {
    //           [field as string]: sortOrder,
    //         },
    //       },
    //     };
    //   } else if (sortBy.split(".").length === 2) {
    //     const [relation, field] = sortBy.split(".");
    //     orderBy = { [relation as string]: { [field as string]: sortOrder } };
    //   } else {
    //     orderBy = { [sortBy]: sortOrder };
    //   }
    // }
const sortOrder = (query.sortOrder ?? "desc") ;
const sortBy = query.sortBy || "createdAt";

let orderBy:doctorOrderByWithRelationInput  = {};

const parts = sortBy.split(".");

// if (parts.length === 3) {
//   const [relation, subRelation, field] = parts;
//   orderBy = { [relation as string]: { [subRelation as string]: { [field as string]: sortOrder } } };
// } else 
    if (parts.length === 2) {
  const [relation, field] = parts;
  orderBy = { [relation as string]: { [field as string]: sortOrder } };
} else {
  orderBy = { [sortBy]: sortOrder };
}
    const data = await prisma.doctor.findMany({ orderBy:{
        'user':{'name':'asc'}
    }, skip, take,include:{user:true,specialities:{include:{specialty:true}}} });
    return data;
  } catch (error) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to retrieve doctors",
      error instanceof Error ? error.stack : undefined,
    );
  }
};
