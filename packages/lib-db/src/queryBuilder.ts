export interface ITakaroQuery<T> {
  filters?: {
    [key in keyof T]?: string | number;
  };
  page?: number;
  limit?: number;
  sortBy?: keyof T;
  sortDirection?: SortDirection;
}

export enum SortDirection {
  asc = 'asc',
  desc = 'desc',
}

export class QueryBuilder<T> {
  constructor(private readonly query: ITakaroQuery<T> = {}) {}

  build() {
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
        filters[filter] = searchVal;
      }
    }

    return filters;
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
