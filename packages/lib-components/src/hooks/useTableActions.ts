import { PaginationState } from '@tanstack/react-table';
import { AxiosResponse } from 'axios';
import { useState } from 'react';

interface APIOutput<T> {
  data: T[];
}

interface Paginated<T> {
  rows: T[];
  pageCount: number;
}

export function useTableActions<T>(pageIndex = 0, pageSize = 10) {
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex,
    pageSize,
  });

  function paginate(response: AxiosResponse<APIOutput<T>>): Paginated<T> {
    setPaginationState({
      pageIndex: paginationState.pageIndex++,
      pageSize: paginationState.pageSize,
    });

    return {
      rows: response.data.data,
      pageCount: Math.ceil(
        response.data.data.length / paginationState.pageSize
      ),
    };
  }

  return {
    pagination: { paginate, paginationState, setPaginationState },
  };
}
