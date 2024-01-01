import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { QueryBuilder as ObjectionQueryBuilder, Model as ObjectionModel, Page, AnyQueryBuilder } from 'objection';

export class ITakaroQuery<T> {
  @IsOptional()
  filters?: {
    [key in keyof T]?: unknown[] | unknown;
  };

  @IsOptional()
  search?: {
    [key in keyof T]?: unknown[] | unknown;
  };

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy?: Extract<keyof T, string>;

  @IsOptional()
  @IsString()
  @IsEnum(['asc', 'desc'])
  sortDirection?: SortDirection;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString({ each: true })
  extend?: string[];
}

export enum SortDirection {
  asc = 'asc',
  desc = 'desc',
}

export class QueryBuilder<Model extends ObjectionModel, OutputDTO> {
  constructor(private readonly query: ITakaroQuery<OutputDTO> = new ITakaroQuery()) {}

  build(query: ObjectionQueryBuilder<Model, Model[]>): ObjectionQueryBuilder<Model, Page<Model>> {
    const tableName = query.modelClass().tableName;

    const pagination = this.pagination();
    const sorting = this.sorting();

    let qry = query.page(pagination.page, pagination.limit).orderBy(sorting.sortBy, sorting.sortDirection);

    if (this.query.startDate) {
      qry = qry.where(`${tableName}.createdAt`, '>=', this.query.startDate);
    }
    if (this.query.endDate) {
      qry = qry.where(`${tableName}.createdAt`, '<=', this.query.endDate);
    }

    qry = this.filters(tableName, qry);

    if (this.query.search) {
      qry.where((builder) => {
        for (const search in this.query.search) {
          if (Object.prototype.hasOwnProperty.call(this.query.search, search)) {
            const searchVal = this.query.search[search];
            if (Array.isArray(searchVal)) {
              searchVal.forEach((val) => {
                if (val) {
                  builder.orWhere(`${tableName}.${search}`, 'ilike', `%${val}%`);
                }
              });
            }
          }
        }
      });
    }

    for (const extend of this.query.extend ?? []) {
      qry.withGraphFetched(extend);
    }

    return qry;
  }

  private filters(
    tableName: string,
    query: ObjectionQueryBuilder<Model, Page<Model>>
  ): ObjectionQueryBuilder<Model, Page<Model>> {
    for (const filter in this.query.filters) {
      if (Object.prototype.hasOwnProperty.call(this.query.filters, filter)) {
        const searchVal = this.query.filters[filter];

        if (searchVal && Array.isArray(searchVal)) {
          const filtered = searchVal.filter(Boolean);
          if (filtered.length) {
            query.whereIn(`${tableName}.${filter}`, searchVal.filter(Boolean) as unknown as AnyQueryBuilder);
          }
        }
      }
    }

    return query;
  }

  private sorting(): { sortBy: string; sortDirection: SortDirection } {
    if (!this.query.sortBy) {
      return {
        sortBy: 'id',
        sortDirection: SortDirection.asc,
      };
    }
    return {
      sortBy: this.query.sortBy,
      sortDirection: this.query.sortDirection ?? SortDirection.asc,
    };
  }

  private pagination() {
    return {
      page: this.query.page ?? 0,
      limit: this.query.limit ?? 100,
    };
  }
}
