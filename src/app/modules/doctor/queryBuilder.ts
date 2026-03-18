import status from "http-status";
import { AppError } from "../../errorHelplers/appError";
import type { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";

export class QueryBuilder {
  query: IQueryParams;
  model: keyof typeof prisma; // ✅ prisma-র valid model name হবে

  page: number;
  skip: number;
  take: number;

  sortBy: string;
  sortOrder: "asc" | "desc";
  orderBy:
    | Record<string, "asc" | "desc">
    | Record<string, Record<string, "asc" | "desc">> = {};


  searchCondition: Record<string, unknown>[] = [];
  numberSearchFields: string[] = [];
  stringSearchFields: string[] = [];
  searchItem?: string | undefined;


 filterCondition: Record<string, unknown>[] = [];
       include: Record<string, unknown>={}


  constructor(
    query: IQueryParams,
    model: keyof typeof prisma,
    numberSearchFields: string[],
    stringSearchFields: string[],
  ) {
    this.query = query;
    this.model = model;
    //rule-1 pagination
    this.page = Number(this.query?.page) || 1;
    this.take = Number(this.query?.limit) || 10;
    this.skip = (this.page - 1) * this.take;
    //rule-2 sorting
    this.sortOrder = this.query?.sortOrder ?? "desc";
    this.sortBy = this.query.sortBy || "createdAt";
    //rule-3 search
    this.numberSearchFields = numberSearchFields;
    this.stringSearchFields = stringSearchFields;
    this.searchItem = this.query?.searchTerm || undefined;

  }

  //rule-2 sorting function

  sort() {
    const parts = this.sortBy.split(".");
    if (parts.length > 2) {
      console.log(
        "coming here to check the sorting with more than two level of nesting",
      );
      throw new AppError(
        status.BAD_REQUEST,
        "Sorting only works with two levels of nesting",
      );
      return;
    }
    if (parts.length === 2) {
      const [relation, field] = parts;
      this.orderBy = {
        [relation as string]: { [field as string]: this.sortOrder },
      };
    } else {
      this.orderBy = { [this.sortBy]: this.sortOrder };
    }
  }

  //rule-3 search function
  search() {
    if (this.searchItem) {
      const numericValue = Number(this.searchItem);
      if (!isNaN(numericValue)) {
        this.numberSearchFields?.forEach((item: string) => {
          if (item.includes(".")) {
            const exactFieldofSearch = item.split(".");
            if (exactFieldofSearch.length === 3) {
              console.log("searching in relation with two level of nesting");
              const [relation, subRelation, field] = exactFieldofSearch;
              this.searchCondition.push({
                [relation as string]: {
                  some: {
                    [subRelation as string]: {
                      [field as string]: Number(this.searchItem),
                    },
                  },
                },
              });
            } else if (exactFieldofSearch.length === 2) {
              const [relation, field] = exactFieldofSearch;
              this.searchCondition.push({
                [relation as string]: {
                  [field as string]: Number(this.searchItem),
                },
              });
            }
          }

          this.searchCondition.push({
            [item as string]: Number(this.searchItem),
          });
        });
      } else {
        console.log("coming here to string search");
        this.stringSearchFields?.forEach((item: string) => {
          if (item.includes(".")) {
            const exactFieldofSearch = item.split(".");
            if (exactFieldofSearch.length === 3) {
              console.log("searching in relation with two level of nesting");
              const [relation, subRelation, field] = exactFieldofSearch;
              this.searchCondition.push({
                [relation as string]: {
                  some: {
                    [subRelation as string]: {
                      [field as string]: {
                        contains: this.searchItem as string,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              });
            } else if (exactFieldofSearch.length === 2) {
              const [relation, field] = exactFieldofSearch;
              this.searchCondition.push({
                [relation as string]: {
                  [field as string]: {
                    contains: this.searchItem as string,
                    mode: "insensitive",
                  },
                },
              });
            }
          } else if (!item.includes(".")) {
            this.searchCondition.push({
              [item as string]: {
                contains: this.searchItem as string,
                mode: "insensitive",
              },
            });
          }
        });
      }
    }
  }

  //rule-4 filter function
  filter(){
     const excludedField = [
          "searchTerm",
          "page",
          "limit",
          "sortBy",
          "sortOrder",
          "fields",
          "include",
        ];
    
       
        Object.keys(this.query).forEach((field) => {
          if (excludedField.includes(field)) return;
          const value =this. query[field];
          const parts = field.split(".");
          if (parts.length === 3) {
            const [relation, subRelation, actualField] = parts;
            const bracketMatch = actualField?.match(
              /^(.+)\[(gt|lt|gte|lte|equals)\]$/,
            );
            if (bracketMatch) {
              const [, actualField2, operator] = bracketMatch;
              const numericValue = Number(value);
              this.filterCondition.push({
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
    
              this.filterCondition.push({
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
              this.filterCondition.push({
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
    
              this.filterCondition.push({
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
    
              this.filterCondition.push({
                [relation as string]: {
                  [actualField2 as string]: {
                    in: allNumeric ? value.map(Number) : value,
                  },
                },
              });
            } else {
              const numericValue = Number(value);
    
              this.filterCondition.push({
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
    
              this.filterCondition.push({
                [actualField as string]: {
                  [operator as string]: isNaN(numericValue) ? value : numericValue,
                },
              });
            }
            //array value handle
            else if (Array.isArray(value)) {
              const allNumeric = value.every((v) => !isNaN(Number(v)));
    
              this.filterCondition.push({
                [field]: {
                  in: allNumeric ? value.map(Number) : value, // number[] বা string[]
                },
              });
            } else {
              const numericValue = Number(value);
              this.filterCondition.push({
                [field]: isNaN(numericValue) ? value : numericValue,
              });
            }
          }
        });
  }

//rule-5 include function
dynamicInclude(){
        if (this.query?.include) {
          const includeAllFields = this.query.include
            .split(",")
            .map((item: string) => item.trim());
          includeAllFields.forEach((item: string) => {
            const includeSubFields = item.split(".");
            if (includeSubFields.length === 2) {
              const [firstField, secondField] = includeSubFields;
              this.include = {
                ...this.include,
                [firstField as string]: {
                  include: { [secondField as string]: true },
                },
              };
            } else {
              this.include = { ...this.include, [item as string]: true };
            }
          });
        }
    
}
//call all functions in execute function and return the result
  callAll() {
    this.sort();
    if (this.searchItem) {
      this.search();
    }
    this.filter();
    this.dynamicInclude();
  }

  // fetch data from database
  fetch = async () => {
    const delegate = prisma[this.model] as any;
    const data = await delegate.findMany({
           where: {
        ...(this.searchCondition.length > 0 && { OR: this.searchCondition }),
        ...(this.filterCondition.length > 0 && { AND: this.filterCondition }),
      },
      include:this.include,
      orderBy: this.orderBy,
      skip: this.skip,
      take: this.take,
    });

    const totalAmountOfData = await delegate.count();

    const meta = {
      page: this.page,
      limit: this.take,
      total: totalAmountOfData,
      totalPages: Math.ceil(totalAmountOfData / this.take),
    };

    return { data, meta };
  };
}
