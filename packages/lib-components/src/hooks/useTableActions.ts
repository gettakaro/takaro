import {
  PaginationState,
  ColumnFiltersState,
  SortingState,
} from '@tanstack/react-table';
import { AxiosResponse } from 'axios';
import { useState } from 'react';
import { APIOutput } from '@takaro/apiclient';

interface ExtendedAPIOutput<T> extends APIOutput {
  data: T[];
}

interface Paginated<T> {
  rows: T[];
  pageCount: number;
  total: number;
}

export function useTableActions<T>(pageIndex = 0, pageSize = 10) {
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex,
    pageSize,
  });
  const [columnFiltersState, setColumnFiltersState] =
    useState<ColumnFiltersState>([]);
  const [sortingState, setSortingState] = useState<SortingState>([]);

  function paginate(
    response: AxiosResponse<ExtendedAPIOutput<T>>
  ): Paginated<T> {
    console.log('this fired');
    setPaginationState({
      pageIndex: paginationState.pageIndex++,
      pageSize: paginationState.pageSize,
    });

    // non-null because this hook is only used when paginating.
    // In that case the metadata will always be present.
    return {
      rows: response.data.data,
      pageCount: response.data.meta.total
        ? Math.ceil(response.data.meta.total! / response.data.meta.limit!)
        : Math.ceil(response.data.data.length / response.data.meta.limit!),
      total: response.data.meta.total!,
    };
  }

  return {
    pagination: { paginate, paginationState, setPaginationState },
    columnFilters: { columnFiltersState, setColumnFiltersState },
    sorting: { sortingState, setSortingState },
  };
}
