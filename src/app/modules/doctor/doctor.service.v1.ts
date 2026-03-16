import type {
  doctorOrderByWithRelationInput,
  doctorWhereInput,
} from "../../../generated/prisma/models";
import type { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";

export const getAllDoctorV1 = async (query: IQueryParams) => {
  //step1: extract pagination parameters
  const page = Number(query?.page) || 1;
  const skip = (page - 1) * Number(query?.limit) || 0;
  const take = Number(query?.limit) || 10;

  //step2: extract sorting parameters
  const sortBy = query?.sortBy || "createdAt";
  const sortOrder = query?.sortOrder || "desc";
  let orderBy: doctorOrderByWithRelationInput = {};
  if (sortBy.includes(".")) {
    // if (sortBy.split(".").length === 4) {
    //   //doctor.specialities.specialty.name
    //   const [relation, subRelation, subSubRelation, field] = sortBy.split(".");
    //   orderBy = {
    //     [relation as string]: {
    //       [subRelation as string]: {
    //         [subSubRelation as string]: {
    //           [field as string]: sortOrder,
    //         },
    //       },
    //     },
    //   };
    // }
    if (sortBy.split(".").length === 3) {
      const [relation, subRelation, field] = sortBy.split(".");
      orderBy = {
        [relation as string]: {
          [subRelation as string]: {
            [field as string]: sortOrder,
          },
        },
      };
    } else if (sortBy.split(".").length === 2) {
      const [relation, field] = sortBy.split(".");
      orderBy = { [relation as string]: { [field as string]: sortOrder } };
    }
  } else {
    orderBy = { [sortBy]: sortOrder };
  }

  //step3: extract searching parameters
  let searchCondition: any = [];
  let searchFields = [
    "user.firstName",
    "specialities.specialty.title",
    "email",
    "id",
    "name",
  ];
  let filterFields = [
    "user.firstName",
    "specialities.specialty.title",
    "email",
    "id",
    "name",
  "appointmentFee[gt]"
  ];
  let searchItem = query?.searchTerm || undefined;
  if (searchItem) {
    searchFields.forEach((item: string) => {
      if (item.includes(".")) {
        const exactFieldofSearch = item.split(".");
        // if (exactFieldofSearch.length === 4) {
        //   const [relation, subRelation, subSubRelation, field] =
        //     exactFieldofSearch;
        //   searchCondition.push({
        //     [relation as string]: {
        //       some: {
        //         [subRelation as string]: {
        //           [subSubRelation as string]: {
        //             [field as string]: {
        //               contains: searchItem,
        //               mode: "insensitive",
        //             },
        //           },
        //         },
        //       },
        //     },
        //   });
        // }
        if (exactFieldofSearch.length === 3) {
          const [relation, subRelation, field] = exactFieldofSearch;
          searchCondition.push({
            [relation as string]: {
              some: {
                [subRelation as string]: {
                  [field as string]: {
                    mode: "insensitive",
                    contains: searchItem,
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
                contains: searchItem,
                mode: "insensitive",
              },
            },
          });
        } else {
          searchCondition.push({
            [item as string]: { contains: searchItem, mode: "insensitive" },
          });
        }
      } else {
        searchCondition.push({
          [item]: {
            contains: searchItem,
            mode: "insensitive",
          },
        });
      }
    });
  }

  //step-4 exact filtering parameter
  let filterConditions:any = [];
  if (searchItem) {
    // ✅ Fix 2 — শুধু OR দাও (search এর জন্য এটাই যথেষ্ট)
    if (searchCondition && searchCondition?.length > 0) {
      filterConditions .push({
        OR: searchCondition,
      });
    }

    // else{

    // searchFields.forEach((item) => {
    //   const exactFieldofSearch = item.split(".");
    // //   if (exactFieldofSearch.length === 4) {
    // //     const [relation, subRelation, subSubRelation, field] =
    // //       exactFieldofSearch;

    // //     filterConditions = {
    // //       // ✅ spread দিয়ে merge করো
    // //       ...filterConditions,
    // //       [relation as string]: {
    // //         [subRelation as string]: {
    // //           [subSubRelation as string]: {
    // //             [field as string]: searchItem,
    // //           },
    // //         },
    // //       },
    // //     };
    // //   }
    //    if (exactFieldofSearch.length === 3) {
    //     const [relation, subRelation, field] = exactFieldofSearch;
    //     filterConditions = {
    //       ...filterConditions,
    //       [relation as string]: {
    //         [subRelation as string]: {
    //           [field as string]: searchItem,
    //         },
    //       },
    //     };
    //   } else if (exactFieldofSearch.length === 2) {
    //     const [relation, field] = exactFieldofSearch;
    //     filterConditions = {
    //       ...filterConditions,
    //       [relation as string]: { [field as string]: searchItem },
    //     };
    //   } else {
    //     filterConditions = {
    //       ...filterConditions,
    //       [item as string]: searchItem,
    //     };
    //   }
    // });

    // }
  }
  if(query?.field){
       filterFields?.forEach(field => {
        if(query[field]){
            filterConditions.push(...filterConditions,{[field as string]:query[field]})
        }
    })
  }
  const result = await prisma.doctor.findMany({
    where: {AND:filterConditions},
    orderBy,
    take: take,
    skip: skip,
  });
  return {
    data:result,
    
  };
};

