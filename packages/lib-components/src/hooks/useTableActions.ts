import { PaginationState, ColumnFiltersState, SortingState, RowSelectionState } from '@tanstack/react-table';
import { useState } from 'react';
import { APIOutput } from '@takaro/apiclient';
import { InfiniteData } from '@tanstack/react-query';

interface ExtendedAPIOutput<T> extends APIOutput {
  data: T[];
}

export interface PageOptions {
  // amount of pages items are spread across
  pageCount: number;
  // total amount of items
  total: number;
}

export function useTableActions<T>(pageIndex = 0, pageSize = 9) {
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex,
    pageSize,
  });
  const [columnFiltersState, setColumnFiltersState] = useState<ColumnFiltersState>([]);
  const [columnSearchState, setColumnSearchState] = useState<ColumnFiltersState>([]);
  const [sortingState, setSortingState] = useState<SortingState>([]);
  const [rowSelectionState, setRowSelectionState] = useState<RowSelectionState>({});

  function getPageOptions(data: InfiniteData<ExtendedAPIOutput<T>>): PageOptions {
    const pageIndex = paginationState.pageIndex;
    const limit = data.pages[pageIndex].meta.limit!;
    const total = data.pages[pageIndex].meta.total!;

    const pageCount = data.pages[pageIndex].meta.total
      ? Math.ceil(total / limit)
      : Math.ceil(data.pages[pageIndex].data.length / limit);

    return {
      pageCount,
      total,
    };
  }

  return {
    pagination: { paginationState, setPaginationState, getPageOptions },
    columnFilters: { columnFiltersState, setColumnFiltersState },
    columnSearch: { columnSearchState, setColumnSearchState },
    sorting: { sortingState, setSortingState },
    rowSelection: { rowSelectionState, setRowSelectionState },
  };
}
