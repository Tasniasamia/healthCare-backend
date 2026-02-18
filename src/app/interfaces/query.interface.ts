export interface PrismaQueryType{
where?:Record<string,unknown>;
include?:Record<string,unknown>;
orderBy?:Record<string,unknown>|Record<string,unknown>[];
take?:number;
skip?:number;
cursor?:Record<string,unknown>;
distinct?:string[]|string;
[key:string]:unknown|undefined

}
export interface CountPrismaQueryType{
    where?:Record<string,unknown>;
    include?:Record<string,unknown>;
    orderBy?:Record<string,unknown>|Record<string,unknown>[];
    take?:number;
    skip?:number;
    cursor?:Record<string,unknown>;
    distinct?:string[]|string;
    [key:string]:unknown|undefined

    }

export interface prismaModelType{
    findMany(args:any):Promise<any[]>;
    count(args:any):Promise<number>

}

export interface IQueryParams{
    searchItem?:string;
    page?:number;
    limit?:number;
    include?:string;
    fields?:string;
    sortBy?:string;
    sortOrder?:'asc'|'des';
    [key:string]:unknown | undefined;


}

export interface TConfig{
    searchableFields:string[],
    filterableFields:string[]
}

export interface prismaQueryConditonType{
    OR?:Record<string,unknown>[];
    NOT?:Record<string,unknown>[];
    AND?:Record<string,unknown>[];
    [key:string]:unknown|undefined;

}

export interface prismaStringFilter{
    contains?:string;
    mode?:string,
    startsWith ?: string;
    endsWith ?: string;
    equals ?: string;
    in ?: string[];
    notIn ?: string[];
    lt ?: string;
    lte ?: string;
    gt ?: string;
    gte ?: string;
    not ?: prismaStringFilter | string;
}

export interface prismaQueryFilterType{
    OR?:Record<string,unknown>;
    NOT?:Record<string,unknown>;
    AND?:Record<string,unknown>;
    
    [key:string]:unknown|undefined;

}

export interface prismaNumberFilter{
    equals?:number;
    in?:number[];
    notIn?:number[];
    lt?:number;
    lte?:number;
    gt?:number;
    gte?:number;
    not?:prismaNumberFilter | number

}