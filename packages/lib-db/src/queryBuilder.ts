import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  QueryBuilder as ObjectionQueryBuilder,
  Model as ObjectionModel,
  Page,
  AnyQueryBuilder,
  Expression,
  PrimitiveValue,
} from 'objection';
import { getKnex } from './knex.js';

export class ITakaroQuery<T> {
  @IsOptional()
  filters?: {
    [key: string]: unknown[] | string[] | boolean | null | undefined;
  };

  @IsOptional()
  search?: {
    [key: string]: unknown[] | string[] | boolean | null | undefined;
  };

  @IsOptional()
  greaterThan?: {
    [key in keyof T]?: unknown;
  };

  @IsOptional()
  lessThan?: {
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
  sortBy?: string;

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

const modelColumns = new Map<string, string[]>();

async function populateModelColumns() {
  const knex = await getKnex();
  // Find all tables
  const tables = await knex.raw(
    // eslint-disable-next-line
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'",
  );
  // For each table, store the columns
  for (const table of tables.rows) {
    const tableName = table.table_name;
    const columns = await knex(tableName).columnInfo();
    modelColumns.set(tableName, Object.keys(columns));
  }
}

await populateModelColumns();

export class QueryBuilder<Model extends ObjectionModel, OutputDTO> {
  private query: ITakaroQuery<OutputDTO>;
  constructor(rawQuery: ITakaroQuery<OutputDTO> = new ITakaroQuery()) {
    this.query = JSON.parse(JSON.stringify(rawQuery));
  }

  /**
   * Our custom query builder can only handle columns that exist in the table
   * However, we might want to do complex/relational logic in higher layers
   * To make sure we don't error out here, we filter out any columns that don't exist in the current table
   */
  private cleanQueryObject(tableName: string) {
    const columns = modelColumns.get(tableName) ?? [];

    for (const key in this.query.filters) {
      if (Object.prototype.hasOwnProperty.call(this.query.filters, key)) {
        if (!columns.includes(key)) {
          if (this.query.filters) {
            this.query.filters[key] = [];
          }
        }
      }
    }

    for (const key in this.query.search) {
      if (Object.prototype.hasOwnProperty.call(this.query.search, key)) {
        if (!columns.includes(key)) {
          if (this.query.search) {
            this.query.search[key] = [];
          }
        }
      }
    }

    return this.query;
  }

  build(queryBuilder: ObjectionQueryBuilder<Model, Model[]>): ObjectionQueryBuilder<Model, Page<Model>> {
    const tableName = queryBuilder.modelClass().tableName;
    this.cleanQueryObject(tableName);

    const pagination = this.pagination();
    const sorting = this.sorting();

    let qry = queryBuilder.page(pagination.page, pagination.limit).orderBy(sorting.sortBy, sorting.sortDirection);

    qry = this.filters(tableName, qry);
    qry = this.greaterThan(tableName, qry);
    qry = this.lessThan(tableName, qry);

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
    query: ObjectionQueryBuilder<Model, Page<Model>>,
  ): ObjectionQueryBuilder<Model, Page<Model>> {
    for (const filter in this.query.filters) {
      if (Object.prototype.hasOwnProperty.call(this.query.filters, filter)) {
        const searchVal = this.query.filters[filter];

        if (searchVal && Array.isArray(searchVal)) {
          if (searchVal.includes('null')) {
            query.whereNull(`${tableName}.${filter}`);
            continue;
          }

          if (searchVal.length) {
            query.whereIn(`${tableName}.${filter}`, searchVal.filter(Boolean) as unknown as AnyQueryBuilder);
          }
        }
      }
    }

    return query;
  }

  private greaterThan(
    tableName: string,
    query: ObjectionQueryBuilder<Model, Page<Model>>,
  ): ObjectionQueryBuilder<Model, Page<Model>> {
    for (const filter in this.query.greaterThan) {
      if (Object.prototype.hasOwnProperty.call(this.query.greaterThan, filter)) {
        const searchVal = this.query.greaterThan[filter];
        if (searchVal) {
          query.where(`${tableName}.${filter}`, '>=', searchVal as unknown as Expression<PrimitiveValue>);
        }
      }
    }

    return query;
  }

  private lessThan(
    tableName: string,
    query: ObjectionQueryBuilder<Model, Page<Model>>,
  ): ObjectionQueryBuilder<Model, Page<Model>> {
    for (const filter in this.query.lessThan) {
      if (Object.prototype.hasOwnProperty.call(this.query.lessThan, filter)) {
        const searchVal = this.query.lessThan[filter];
        if (searchVal) {
          query.where(`${tableName}.${filter}`, '<=', searchVal as unknown as Expression<PrimitiveValue>);
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
