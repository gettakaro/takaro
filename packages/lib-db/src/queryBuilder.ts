export interface ITakaroQuery<T> {
  filters: {
    [key in keyof T]?: string | number;
  };
  page: number;
  limit: number;
  sortBy?: keyof T;
  sortDirection?: SortDirection;
}

export enum SortDirection {
  asc = 'asc',
  desc = 'desc',
}

type CombineOpts = 'AND' | 'OR' | null;

export class QueryBuilder<T> {
  constructor(
    public domainId: string | null,
    private readonly query: Partial<ITakaroQuery<T>> = {}
  ) {}

  build(combineOpts: CombineOpts = 'AND') {
    return {
      where: this.filters(combineOpts),
      orderBy: this.sorting(),
    };
  }

  private filters(type: CombineOpts) {
    const filters: Record<string, Record<string, unknown>> = {};

    for (const filter in this.query.filters) {
      if (Object.prototype.hasOwnProperty.call(this.query.filters, filter)) {
        const searchVal = this.query.filters[filter];
        filters[filter] = { equals: searchVal };
      }
    }

    if (this.domainId) {
      filters.domainId = { equals: this.domainId };
    }

    switch (type) {
      case 'AND':
        return {
          AND: filters,
        };
      case 'OR':
        return {
          OR: filters,
        };
      default:
        return filters;
    }
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
