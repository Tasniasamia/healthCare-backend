import type {
  CountPrismaQueryType,
  IQueryParams,
  prismaModelType,
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
  private sortBy: string | undefined = "createdAt";
  private sortOrder: "asc" | "des" = "asc";
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
  search(): this {
    const { searchItem } = this.queryParams;
    const { searchableFields } = this.config;
    if (searchItem && searchableFields && searchableFields.length > 0) {
      const searchCondition: Record<string, unknown>[] = searchableFields?.map(
        (field: any) => {
          const stringFilter: prismaStringFilter = {
            contains: searchItem,
            mode: "intensitive" as const,
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

}