import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { QueryBuilder as ObjectionQueryBuilder, Model, Page } from 'objection';

export class ITakaroQuery<T> {
  @IsOptional()
  filters?: {
    [key in keyof T]?: unknown;
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
  @IsString({ each: true })
  extend?: string[];
}

export enum SortDirection {
  asc = 'asc',
  desc = 'desc',
}

export class QueryBuilder<T extends Model> {
  constructor(private readonly query: ITakaroQuery<T> = new ITakaroQuery()) {}

  build(
    query: ObjectionQueryBuilder<T, T[]>
  ): ObjectionQueryBuilder<T, Page<T>> {
    const tableName = query.modelClass().tableName;

    const filters = this.filters(tableName);
    const pagination = this.pagination();
    const sorting = this.sorting();

    const qry = query
      .where(filters)
      .page(pagination.page, pagination.limit)
      .orderBy(sorting.sortBy, sorting.sortDirection);

    for (const extend of this.query.extend ?? []) {
      qry.withGraphJoined(extend);
    }

    return qry;
  }

  private filters(tableName: string) {
    const filters: Record<string, unknown> = {};

    for (const filter in this.query.filters) {
      if (Object.prototype.hasOwnProperty.call(this.query.filters, filter)) {
        const searchVal = this.query.filters[filter];
        if (searchVal) {
          filters[`${tableName}.${filter}`] = searchVal;
        }
      }
    }

    return filters;
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
      limit: this.query.limit ?? 10,
    };
  }
}
