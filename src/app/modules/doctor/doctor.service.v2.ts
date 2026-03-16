import status from "http-status";
import type { IQueryParams } from "../../interfaces/query.interface";
import { AppError } from "../../errorHelplers/appError";
import { prisma } from "../../lib/prisma";
import type {
  doctorOrderByWithRelationInput,
  doctorWhereInput,
} from "../../../generated/prisma/models";
import type { Prisma } from "../../../generated/prisma/client";

export const getAllDoctorV2 = async (query: IQueryParams) => {
  try {
    //rule-1 pagination
    const page = Number(query?.page) || 1;
    const skip = (page - 1) * Number(query?.limit) || 0;
    const take = Number(query?.limit) || 10;

    //rule-2 sorting
    // const searchFields = [
    //   "name",
    //   "email",
    //   "address",
    //   "gender",
    //   "appointmentFee",
    //   "user.status",
    //   "doctorSchedules.isBooked"
    // ]

    const sortOrder = query.sortOrder ?? "desc";
    const sortBy = query.sortBy || "createdAt";

    let orderBy: doctorOrderByWithRelationInput = {};

    const parts = sortBy.split(".");
    if (parts.length === 2) {
      const [relation, field] = parts;
      orderBy = { [relation as string]: { [field as string]: sortOrder } };
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    //Rule-3 searcing data
    let searchCondition: doctorWhereInput[] = [];

    const stringSearchFields = [
      "user.name",
      "specialities.specialty.title",
      "email",
      "id",
      "name",
    ];
    const numberSearchFields = [
      "appointmentFee",
      "avaerageRating",
      "experience",
    ];
    const searchItem = query?.searchTerm || undefined;

    if (searchItem) {
      const numericValue = Number(searchItem);
      if (!isNaN(numericValue)) {
        numberSearchFields?.forEach((item: string) => {
          if (item.includes(".")) {
            const exactFieldofSearch = item.split(".");
            if (exactFieldofSearch.length === 3) {
              console.log("searching in relation with two level of nesting");
              const [relation, subRelation, field] = exactFieldofSearch;
              searchCondition.push({
                [relation as string]: {
                  some: {
                    [subRelation as string]: {
                      [field as string]: Number(searchItem),
                    },
                  },
                },
              });
            } else if (exactFieldofSearch.length === 2) {
              const [relation, field] = exactFieldofSearch;
              searchCondition.push({
                [relation as string]: {
                  [field as string]: Number(searchItem),
                },
              });
            }
          }

          searchCondition.push({
            [item as string]: Number(searchItem),
          });
        });
      } 
      else {
        console.log("coming here to string search");
        stringSearchFields?.forEach((item: string) => {
          if (item.includes(".")) {
            const exactFieldofSearch = item.split(".");
            if (exactFieldofSearch.length === 3) {
              console.log("searching in relation with two level of nesting");
              const [relation, subRelation, field] = exactFieldofSearch;
              searchCondition.push({
                [relation as string]: {
                  some: {
                    [subRelation as string]: {
                      [field as string]: {
                        contains: searchItem as string,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              });
            } else if (exactFieldofSearch.length === 2) {
              const [relation, field] = exactFieldofSearch;
              searchCondition.push({
                [relation as string]: {
                  [field as string]: {
                    contains: searchItem as string,
                    mode: "insensitive",
                  },
                },
              });
            }
          } else if (!item.includes(".")) {
            searchCondition.push({
              [item as string]: {
                contains: searchItem as string,
                mode: "insensitive",
              },
            });
          }
        });
      }
    }

// Rule-4: Dynamic Filter
const excludedField = [
  "searchTerm", "page", "limit", "sortBy", "sortOrder", "fields", "include",
];

const filterCondition: doctorWhereInput[] = [];

Object.keys(query).forEach((field) => {
  if (excludedField.includes(field)) return;

  const value = query[field];

  const bracketMatch = field.match(/^(.+)\[(gt|lt|gte|lte|equals)\]$/);

  if (bracketMatch) {
    const [, actualField, operator] = bracketMatch;
    const numericValue = Number(value);

    filterCondition.push({
      [actualField as string]: {
        [operator as string]: isNaN(numericValue) ? value : numericValue,
      },
    });
  } else {
    console.log("not bracket match", field, value);
    const numericValue = Number(value);
    filterCondition.push({
      [field]: isNaN(numericValue) ? value : numericValue,
    });
  }



});



    const data = await prisma.doctor.findMany({

      where: {
    ...(searchCondition.length > 0 && { OR: searchCondition }),
    ...(filterCondition.length > 0 && { AND: filterCondition }),
  },
      orderBy,
      skip,
      take,
      include: {
        user: true,
        specialities: { include: { specialty: true } },
        doctorSchedules: true,
      },
    });
    return data;
  } catch (error) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to retrieve doctors",
      error instanceof Error ? error.stack : undefined,
    );
  }
};
