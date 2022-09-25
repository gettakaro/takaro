import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

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
  sortBy?: keyof T;

  @IsOptional()
  @IsString()
  @IsEnum(['asc', 'desc'])
  sortDirection?: SortDirection;
}

export enum SortDirection {
  asc = 'asc',
  desc = 'desc',
}

export class QueryBuilder<T> {
  private filterTable: string | null = null;

  constructor(private readonly query: ITakaroQuery<T> = {}) {}

  build(filterTable?: string) {
    if (filterTable) this.filterTable = filterTable;
    return {
      where: this.filters(),
      orderBy: this.sorting(),
    };
  }

  private filters() {
    const filters: Record<string, any> = {};

    for (const filter in this.query.filters) {
      if (Object.prototype.hasOwnProperty.call(this.query.filters, filter)) {
        const searchVal = this.query.filters[filter];
        if (searchVal) {
          filters[this.applyFilterTable(filter)] = searchVal;
        }
      }
    }

    return filters;
  }

  private applyFilterTable(key: string) {
    if (!this.filterTable) return key;
    return `${this.filterTable}.${key}`;
  }

  private sorting() {
    if (!this.query.sortBy) {
      return {
        id: this.query.sortDirection ?? SortDirection.asc,
      };
    }
    return {
      [this.query.sortBy]: this.query.sortDirection,
    };
  }
}
