import type {
  CountPrismaQueryType,
  IQueryParams,
  prismaModelType,
  prismaNumberFilter,
  prismaQueryConditonType,
  PrismaQueryType,
  prismaStringFilter,
  TConfig,
} from "../interfaces/query.interface";

export class QueryBuilder<T, TWhereInput, TIncludeInput> {
  private query: PrismaQueryType = {};
  private count: CountPrismaQueryType = {};
  private page: number = 1;
  private limit: number = 10;
  private skip: number = 0;
  private sortBy: string | undefined = "createAt";
  private sortOrder: "asc" | "desc" = "asc";
  private selectFields: Record<string, boolean> = {};

  constructor(
    private model: prismaModelType,
    private queryParams: IQueryParams,
    private config: TConfig
  ) {
    this.query = {
      where: {},
      include: {},
      orderBy: {},
      take: this.limit,
      skip: this.skip,
    };
    this.count = {
      where: {},
      include: {},
      orderBy: {},
      take: this.limit,
      skip: this.skip,
    };
  }
  //where method
  search(): this {
    const { searchItem } = this.queryParams;
    const { searchableFields } = this.config;
    if (searchItem && searchableFields && searchableFields.length > 0) {
      const searchCondition: Record<string, unknown>[] = searchableFields?.map(
        (field: any) => {
          const stringFilter: prismaStringFilter = {
            contains: searchItem,
            mode: "insensitive" as const,
          };
          if (field.includes(".")) {
            const parts = field.split(".");

            if (parts.length == 2) {
              const [relation, field] = parts;
              return {
                [relation]: {
                  some: {
                    [field]: stringFilter,
                  },
                },
              };
            } else if (parts.length === 3) {
              const [relation, nextRelation, field] = parts;
              return {
                [relation]: {
                  some: {
                    [nextRelation]: {
                      some: {
                        [field]: stringFilter,
                      },
                    },
                  },
                },
              };
            }
          }
          return {
            [field]: stringFilter,
          };
        }
      );

      const queryWhereConditon = this.query.where as prismaQueryConditonType;
      queryWhereConditon.OR = searchCondition;
      const countqueryWhereConditon = this.query
        .where as prismaQueryConditonType;
      countqueryWhereConditon.OR = searchCondition;
    }

    return this;
  }
  //   result:
  //Example-1 name  searchItem='tasnia'
  //   this.query={
  //         where:
  //         {name:
  //             {contain:'tasnia',mode:'intensitive'}
  //         }
  //     }
  // }
  // Example-2 user.name  searchItem='tasnia'
  //   this.query={
  //         where:
  //         {user:
  //         {name:
  //             {contain:'tasnia',mode:'intensitive'}
  //         }
  //        }}
  //     }
  // }

  //where method
  filter(): this {
    const { filterableFields } = this.config || [];

    const exclude = [
      "searchItem",
      "page",
      "limit",
      "include",
      "fields",
      "sortBy",
      "sortOrder",
    ];
    const filterParams: Record<string, unknown> = {};

    Object.keys(this.queryParams)?.forEach((field) => {
      if (!exclude?.includes(field)) {
        filterParams[field] = this.queryParams[field];
      }
    });

    const queryWhereConditon = this.query.where as Record<string, unknown>;
    const countqueryWhereConditon = this.count.where as prismaQueryConditonType;
    Object.keys(filterParams).forEach((key: string) => {
      const value = filterParams[key];
      if (value === "" || value === undefined) {
        return;
      }

      const isAllowed =
        filterableFields &&
        filterableFields.length > 0 &&
        filterableFields.includes(key);
      if (!isAllowed) {
        return;
      }

      if (key.includes(".")) {
        const parts = key.split(".");

        if (parts.length == 2) {
          const [relation, field] = parts;
          queryWhereConditon[relation as string] = {
            [field as string]: this.parseFilterValue(value)
          };
          countqueryWhereConditon[relation as string] = {
           [field as string]: this.parseFilterValue(value)
          };
          // return;
          //  result:
          //  where:{
          //   user:
          //   {name:'tasnia'}
          // }
        } else if (parts.length === 3) {
          const [relation, nextRelation, field] = parts;
          queryWhereConditon[relation as string] = {
            [nextRelation as string]: {
             [field as string]: this.parseFilterValue(value),
            },
          };
          countqueryWhereConditon[relation as string] = {
            [nextRelation as string]: {
              [field as string]: this.parseFilterValue(value),
            },
          };
          // return;
          //  result:
          //  where:{
          //   user: {
          //   doctor:
          //  {name:'tasnia'}
          //   }
          //   }
        }
      } else {
        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          queryWhereConditon[key] = this.parseFilterRange(value as Record<string,unknown>);
          countqueryWhereConditon[key] = this.parseFilterRange(value as Record<string,unknown> );
        //  result
        //  where{appointmentFee :{gt:500}}
        }
        else{
          queryWhereConditon[key] = this.parseFilterValue(value);
          countqueryWhereConditon[key] = this.parseFilterValue(value);
             // result
          // where:{
          //   name:'tasnia'
          // }
        }
      

      }
    });

    return this;
  }
  //From my sake
  // filter(): this {
  //   const { filterableFields } = this.config || [];
  
  //   const exclude = [
  //     "searchItem",
  //     "page",
  //     "limit",
  //     "include",
  //     "fields",
  //     "sortBy",
  //     "sortOrder",
  //   ];
  
  //   const filterParams: Record<string, unknown> = {};
  
  //   // Collect allowed filter params
  //   Object.keys(this.queryParams)?.forEach((field) => {
  //     if (!exclude.includes(field)) {
  //       filterParams[field] = this.queryParams[field];
  //     }
  //   });
  
  //   const queryWhereCondition = this.query.where as Record<string, unknown>;
  //   const countQueryWhereCondition = this.count.where as Record<string, unknown>;
  
  //   Object.keys(filterParams).forEach((key: string) => {
  //     const value = filterParams[key];
  //     if (value === "" || value === undefined) return;
  
  //     // Check allowed fields
  //     const isAllowed =
  //       filterableFields &&
  //       filterableFields.length > 0 &&
  //       filterableFields.includes(key);
  //     if (!isAllowed) return;
  
  //     // Nested field handling
  //     if (key.includes(".")) {
  //       const parts = key.split(".");
  
  //       if (parts.length === 2) {
  //         const [relation, field] = parts;
  
  //         // Merge instead of overwrite
  //         queryWhereCondition[relation as string] = {
  //           ...(queryWhereCondition[relation as string] as Record<string, unknown>),
  //           [field as string]: this.parseFilterValue(value),
  //         };
  //         countQueryWhereCondition[relation as string] = {
  //           ...(countQueryWhereCondition[relation as string] as Record<string, unknown>),
  //           [field as string]: this.parseFilterValue(value),
  //         };
  //       } else if (parts.length === 3) {
  //         const [relation, nextRelation, field] = parts;
  
  //         queryWhereCondition[relation as string] = {
  //           ...(queryWhereCondition[relation as string] as Record<string, unknown>),
  //           [nextRelation as string]: {
  //             ...((queryWhereCondition[relation as string] as Record<string, unknown>)?.[nextRelation as string] as Record<string, unknown>),
  //             [field as string]: this.parseFilterValue(value),
  //           },
  //         };
  
  //         countQueryWhereCondition[relation as string] = {
  //           ...(countQueryWhereCondition[relation as string] as Record<string, unknown>),
  //           [nextRelation as string]: {
  //             ...((countQueryWhereCondition[relation as string] as Record<string, unknown>)?.[nextRelation as string] as Record<string, unknown>),
  //             [field as string]: this.parseFilterValue(value),
  //           },
  //         };
  //       }
  //     } 
  //     // Normal / range fields
  //     else {
  //       if (typeof value === "object" && value !== null && !Array.isArray(value)) {
  //         // Merge existing range filter
  //         queryWhereCondition[key] = {
  //           ...((queryWhereCondition[key] as Record<string, unknown>) || {}),
  //           ...this.parseFilterRange(value as Record<string, unknown>),
  //         };
  //         countQueryWhereCondition[key] = {
  //           ...((countQueryWhereCondition[key] as Record<string, unknown>) || {}),
  //           ...this.parseFilterRange(value as Record<string, unknown>),
  //         };
  //       } else {
  //         queryWhereCondition[key] = this.parseFilterValue(value);
  //         countQueryWhereCondition[key] = this.parseFilterValue(value);
  //       }
  //     }
  //   });
  
  //   return this;
  // }

  paginate(): this {
    const { page, limit } = this.queryParams;
  
    this.page = Number(page) > 0 ? Number(page) : 1;
    this.limit = Number(limit) > 0 ? Number(limit) : 10;
  
    this.skip = (this.page - 1) * this.limit;
  
    this.query.take = this.limit;
    this.query.skip = this.skip;
  
    return this;
  }
  

   //orderby method
   sort():this{
    const sortBy = (this.queryParams.sortBy as string)?.trim() || "createAt";
    const sortOrder = this.queryParams.sortOrder === 'asc' ? 'asc' : 'desc';

    this.sortBy = sortBy;
    this.sortOrder = sortOrder;

    // /doctors?sortBy=user.name&sortOrder=asc => orderBy: { user: { name: 'asc' } }

    if(sortBy.includes(".")){
        const parts = sortBy.split(".");

        if(parts.length === 2){
            const [relation, nestedField] = parts;

            this.query.orderBy = {
                [relation as string] : {
                    [nestedField as string] : sortOrder
                }
            }
        }else if(parts.length === 3){
            const [relation, nestedRelation, nestedField] = parts;

            this.query.orderBy = {
                [relation as string] : {
                    [nestedRelation as string] : {
                        [nestedField as string] : sortOrder
                    }
                }
            }
        }else{
            this.query.orderBy = {
                [sortBy] : sortOrder
            }
        }
    }else{
        this.query.orderBy = {
            [sortBy]: sortOrder
        }
    }
    return this;
   }

   //select method
   fields(): this {
    const { fields } = this.queryParams;
  
    if (fields && typeof fields === "string") {
      const fieldsArray = fields.split(",");
  
  
      fieldsArray.forEach((field: string) => {
        this.selectFields[field.trim()] = true;


       
      });
      this.query.select = this.selectFields;

      delete this.query?.include;
    }
  
    return this;
  }

  include(relation:TIncludeInput):this{
    if (Object.keys(this.selectFields).length > 0) {
      return this;
    }
    
    this.query.include={...this?.query?.include,...relation}

    return this;
  }
  
  dynamicInclude(includeConfig:Record<string,unknown>,defaultInclude?:string[]):this{
    if (Object.keys(this.selectFields).length > 0) {
      return this;
    }
    
    const result:Record<string,unknown>={};
    defaultInclude?.forEach((field)=>{
      if(includeConfig[field]){
        result[field]=includeConfig[field];
      }
    });
    if(this?.queryParams?.include){
      const includeParams=(this.queryParams.include as string)?.split(',');
      const includeParamsTrimFree=includeParams?.map?.((i)=>i.trim())
      if(includeParamsTrimFree && includeParamsTrimFree?.length>0){
       includeParamsTrimFree?.forEach((field)=>{
        if(includeConfig[field]){
          result[field]=includeConfig[field];
        }
       })
      }
    }

    this.query.include={...this.query?.include,...result};
  
    return this;
  }

where(condtions:TWhereInput):this{
  this.query.where={...this.query.where,...condtions};
  this.count.where={...this.count.where,...condtions};
  return this;
}
  
// async execute() : Promise<any> {
//   const [ total,data] = await Promise.all([
//       this.model.count(this.count.where),
//       this.model.findMany(this.query as Parameters<typeof this.model.findMany>[0])
//   ])

//   const totalPages = Math.ceil(total / this.limit);

//   return {
//       data : data,
//       meta : {
//           page : this.page,
//           limit : this.limit,
//           total,
//           totalPages,
//       }
//   }

// }
async execute(): Promise<any> {
  const [total, data] = await Promise.all([
    this.model.count({
      where: this.count.where
    }),
    this.model.findMany(this.query)
  ]);

  const totalPages = Math.ceil(total / this.limit);

  return {
    data,
    meta: {
      page: this.page,
      limit: this.limit,
      total,
      totalPages,
    },
  };
}


  private parseFilterValue = (value: unknown): unknown => {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
    if (typeof value === "string" && !isNaN(Number(value)) && value !== "") {
      return Number(value);
    }
    if (Array.isArray(value)) {
      return { in: value.map((i) => this.parseFilterValue(i)) };
      // result
      // {in:[100,200,300]}
    }

    return value;
  };

  private parseFilterRange = (
    //Input value : appointment[gt]=500
    value: Record<string, string | number | (string | number[] |unknown)>
  ): prismaNumberFilter | prismaStringFilter | Record<string, unknown> => {
    const rangeQuery: Record<string, unknown> = {};
    // {appointmentFee:{gt:500}}
    //  string         Record<string,number>|unknown

    Object.keys(value)?.forEach((operator) => {
      const operatorValue = value[operator];
      switch (operator) {
        case "lt":
        case "lte":
        case "gt":
        case "gte":
        case "not":
        case "equals":
        case "contains":
        case "startsWith":
        case "endsWith":
        case "in":
        case "notIn":
          rangeQuery[operator] = this.parseFilterValue(operatorValue);
          break;

        // if(Array.isArray(operatorValue)){

        // }
        default:
          break;
      }
    });
    return Object.keys(rangeQuery)?.length>0?rangeQuery :value;
  };
  // result prismaNumberFilter
  // {gt:500,lt:1000}
  //result prismaStringFilter
  // {contains: searchItem,
  // mode: "intensitive" as const,}
}
