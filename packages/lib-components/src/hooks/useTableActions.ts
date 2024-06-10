import { PaginationState, SortingState, RowSelectionState } from '@tanstack/react-table';
import { useState } from 'react';
import { APIOutput } from '@takaro/apiclient';

interface ExtendedAPIOutput<T> extends APIOutput {
  data: T[];
}

export interface PageOptions {
  // amount of pages items are spread across
  pageCount: number;
  // total amount of items
  total: number;
}

interface TableActionOptions {
  pageIndex: number;
  pageSize: number;
}

export interface ColumnFilter {
  id: string;
  value: string[];
}

export function useTableActions<T>({ pageIndex, pageSize }: TableActionOptions = { pageIndex: 0, pageSize: 10 }) {
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex,
    pageSize,
  });
  const [columnFiltersState, setColumnFiltersState] = useState<ColumnFilter[]>([]);
  const [columnSearchState, setColumnSearchState] = useState<ColumnFilter[]>([]);
  const [sortingState, setSortingState] = useState<SortingState>([]);
  const [rowSelectionState, setRowSelectionState] = useState<RowSelectionState>({});

  function getPageOptions(data: ExtendedAPIOutput<T>): PageOptions {
    // we can use page 0 here because that data is the same for all pages
    const limit = data.meta.limit!;
    const total = data.meta.total!;

    const pageCount = data.meta.total ? Math.ceil(total / limit) : Math.ceil(data.data.length / limit);

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
