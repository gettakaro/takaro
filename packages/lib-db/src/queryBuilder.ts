export interface ITakaroQuery {
  filters: {
    [key: string]: unknown;
  };
  page: number;
  limit: number;
  sortBy: string;
  sortDirection: string;
}

export class QueryBuilder {
  constructor(private query: Partial<ITakaroQuery> = {}) {}

  build() {
    return {
      filters: this.filters(),
    };
  }

  private filters() {
    const filters: Record<string, Record<string, unknown>> = {};

    for (const filter in this.query.filters) {
      if (Object.prototype.hasOwnProperty.call(this.query.filters, filter)) {
        const searchVal = this.query.filters[filter];
        filters[filter] = { equals: searchVal };
      }
    }

    return {
      AND: filters,
    };
  }
}
