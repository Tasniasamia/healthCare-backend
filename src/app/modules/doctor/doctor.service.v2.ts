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

    //rule-2 sorting  (only two layer working here like (user.name)

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
      } else {
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
      "searchTerm",
      "page",
      "limit",
      "sortBy",
      "sortOrder",
      "fields",
      "include",
    ];

    const filterCondition: doctorWhereInput[] = [];

    Object.keys(query).forEach((field) => {
      if (excludedField.includes(field)) return;
      const value = query[field];
      const parts = field.split(".");
      if (parts.length === 3) {
        const [relation, subRelation, actualField] = parts;
        const bracketMatch = actualField?.match(
          /^(.+)\[(gt|lt|gte|lte|equals)\]$/,
        );
        if (bracketMatch) {
          const [, actualField2, operator] = bracketMatch;
          const numericValue = Number(value);
          filterCondition.push({
            [relation as string]: {
              some: {
                [subRelation as string]: {
                  [actualField2 as string]: {
                    [operator as string]: isNaN(numericValue)
                      ? value
                      : numericValue,
                  },
                },
              },
            },
          });
        } else if (Array.isArray(value)) {
          const allNumeric = value.every((v) => !isNaN(Number(v)));

          filterCondition.push({
            [relation as string]: {
              some: {
                [subRelation as string]: {
                  [actualField as string]: {
                    in: allNumeric ? value.map(Number) : value, // number[] বা string[]
                  },
                },
              },
            },
          });
        } else {
          const numericValue = Number(value);
          filterCondition.push({
            [relation as string]: {
              some: {
                [subRelation as string]: {
                  [actualField as string]: isNaN(numericValue)
                    ? value
                    : numericValue,
                },
              },
            },
          });
        }
      } else if (parts.length === 2) {
        const [relation, actualField2] = parts;
        const bracketMatch = actualField2?.match(
          /^(.+)\[(gt|lt|gte|lte|equals)\]$/,
        );

        if (bracketMatch) {
          const [, actualField3, operator] = bracketMatch;
          const numericValue = Number(value);

          filterCondition.push({
            [relation as string]: {
              [actualField3 as string]: {
                [operator as string]: isNaN(numericValue)
                  ? value
                  : numericValue,
              },
            },
          });
        } else if (Array.isArray(value)) {
          const allNumeric = value.every((v) => !isNaN(Number(v)));

          filterCondition.push({
            [relation as string]: {
              [actualField2 as string]: {
                in: allNumeric ? value.map(Number) : value,
              },
            },
          });
        } else {
          const numericValue = Number(value);

          filterCondition.push({
            [relation as string]: {
              [actualField2 as string]: isNaN(numericValue)
                ? value
                : numericValue,
            },
          });
        }
      } else if (!field.includes(".")) {
        //bracket match
        const bracketMatch = field.match(/^(.+)\[(gt|lt|gte|lte|equals)\]$/);
        if (bracketMatch) {
          const [, actualField, operator] = bracketMatch;
          const numericValue = Number(value);

          filterCondition.push({
            [actualField as string]: {
              [operator as string]: isNaN(numericValue) ? value : numericValue,
            },
          });
        }
        //array value handle
        else if (Array.isArray(value)) {
          const allNumeric = value.every((v) => !isNaN(Number(v)));

          filterCondition.push({
            [field]: {
              in: allNumeric ? value.map(Number) : value, // number[] বা string[]
            },
          });
        } else {
          const numericValue = Number(value);
          filterCondition.push({
            [field]: isNaN(numericValue) ? value : numericValue,
          });
        }
      }
    });

    //Rule-5 include
    let include: Prisma.doctorInclude = {};
    if (query?.include) {
      const includeAllFields = query.include
        .split(",")
        .map((item: string) => item.trim());
      includeAllFields.forEach((item: string) => {
        const includeSubFields = item.split(".");
        if (includeSubFields.length === 2) {
          const [firstField, secondField] = includeSubFields;
          include = {
            ...include,
            [firstField as string]: {
              include: { [secondField as string]: true },
            },
          };
        } else {
          include = { ...include, [item as string]: true };
        }
      });
    }




    const data = await prisma.doctor.findMany({
      where: {
        ...(searchCondition.length > 0 && { OR: searchCondition }),
        ...(filterCondition.length > 0 && { AND: filterCondition }),
      },
      orderBy,
      skip,
      take,
      include,
      // include: {
      //   user: true,
      //   specialities: { include: { specialty: true } },
      //   doctorSchedules: true,
      // },
    });
    const totalAmountOfData = await prisma.doctor.count({
      where: {
        ...(searchCondition.length > 0 && { OR: searchCondition }),
        ...(filterCondition.length > 0 && { AND: filterCondition }),
      },
    });

    const meta = {
      page: page,
      limit: take,
      total: totalAmountOfData,
      totalPages: Math.ceil(totalAmountOfData / take), // ✅ এখন সঠিক কাজ করবে
    };
    return { data, meta };
  } catch (error) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to retrieve doctors",
      error instanceof Error ? error.stack : undefined,
    );
  }
};
