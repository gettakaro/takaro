import { PaginationState, SortingState, RowSelectionState } from '@tanstack/react-table';
import { useState } from 'react';
import { APIOutput } from '@takaro/apiclient';
import { useTableSearchParamKeys } from '../components/data/Table/SearchParams';
import { useSearchParams } from 'react-router-dom';

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
  tableId: string;
}

export interface ColumnFilter {
  id: string;
  value: string[];
}

export function useTableActions<T>({ pageIndex, pageSize, tableId }: TableActionOptions) {
  const [searchParams, _] = useSearchParams();
  const searchParamKeys = useTableSearchParamKeys(tableId);

  const [paginationState, setPaginationState] = useState<PaginationState>(() => {
    const getSafeNumberParam = (paramKey: string, defaultValue: number) => {
      const value = searchParams.get(paramKey);
      return value !== null ? Number(value) : defaultValue;
    };
    return {
      pageIndex: getSafeNumberParam(searchParamKeys.PAGE_INDEX, pageIndex),
      pageSize: getSafeNumberParam(searchParamKeys.PAGE_SIZE, pageSize),
    };
  });

  const [columnFiltersState, setColumnFiltersState] = useState<ColumnFilter[]>(() => {
    const columnFilters = searchParams.get(searchParamKeys.COLUMN_FILTER);
    if (!columnFilters) return [];
    return JSON.parse(columnFilters);
  });

  const [columnSearchState, setColumnSearchState] = useState<ColumnFilter[]>(() => {
    const columnFilters = searchParams.get(searchParamKeys.COLUMN_SEARCH);
    if (!columnFilters) return [];
    return JSON.parse(columnFilters);
  });

  const [sortingState, setSortingState] = useState<SortingState>(() => {
    const columnSort = searchParams.get(searchParamKeys.COLUMN_SORT);
    if (!columnSort) return [];
    return JSON.parse(columnSort);
  });
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
