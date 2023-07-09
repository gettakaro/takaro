import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  useReactTable,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  ColumnOrderState,
  VisibilityState,
} from '@tanstack/react-table';
import { Wrapper, StyledTable, Header, PaginationContainer } from './style';
import { Empty } from '../../../components';
import { Pagination, Sorting } from './subcomponents';

export interface TableProps<DataType extends object> {
  refetching?: boolean;
  data: DataType[];
  spacing?: 'relaxed' | 'tight';
  // currently not possible to type this properly: https://github.com/TanStack/table/issues/4241
  columns: ColumnDef<DataType, any>[];
  sorting?: {
    sortingState: SortingState;
    setSortingState?: OnChangeFn<SortingState>;
  };
  pagination?: {
    paginationState: PaginationState;
    setPaginationState: OnChangeFn<PaginationState>;
    pageCount: number;
    total: number;
    pageSize?: number;
  };
  columnFiltering?: {
    columnFiltersState: ColumnFiltersState;
    setColumnFiltersState: OnChangeFn<ColumnFiltersState>;
  };
  refetch: () => Promise<unknown>;
}

export function Table<DataType extends object>({
  data,
  columns,
  sorting,
  spacing = 'tight',
  pagination,
  columnFiltering,
}: TableProps<DataType>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    columns.map((column) => {
      if (column.id === undefined) {
        throw new Error('Column must have an id');
      }
      return column.id;
    })
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    pageCount: pagination?.pageCount ?? -1,
    manualPagination: true,
    onSortingChange: sorting?.setSortingState,
    onPaginationChange: pagination?.setPaginationState ?? undefined,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: columnFiltering?.setColumnFiltersState ?? undefined,
    manualFiltering: true,
    manualSorting: true,
    autoResetPageIndex: false,
    enableSorting: sorting !== undefined,
    enableSortingRemoval: false,
    onColumnOrderChange: setColumnOrder,

    initialState: {
      columnVisibility,
    },
    state: {
      columnVisibility,
      columnOrder,
      sorting: sorting?.sortingState,
      pagination: pagination?.paginationState,
    },
  });

  // TODO: add a border outline with an empty table message
  if (data.length === 0) {
    return <Empty header="No data" description="Looks like there is no data" actions={[]} />;
  }

  return (
    <Wrapper>
      <Header></Header>

      {/* todo: filter menu 
        {showFilters && (
          <FilterContainer>
            {columnFiltering && (
              <ColumnFilters
                columnFilterState={columnFiltering.columnFiltersState}
                columns={table
                  .getAllLeafColumns()
                  .filter((column) => column.getCanFilter())
                  .map((column) => column.id)}
              />
            )}
          </FilterContainer>
        )}

        {/* table */}
      <StyledTable spacing={spacing}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(({ id, colSpan, column }) => (
                <th key={id} colSpan={colSpan} scope="col">
                  {column.getCanSort() && sorting !== undefined && (
                    <Sorting
                      header={column.columnDef.header as string}
                      setSorting={sorting.setSortingState!}
                      sorting={sorting.sortingState}
                      id={column.id}
                    />
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map(({ column, id, getContext }) => (
                <td key={id}>{flexRender(column.columnDef.cell, getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            {pagination && (
              <td colSpan={columns.length}>
                <PaginationContainer>
                  <span>{pagination.total} results</span>
                  <Pagination
                    pageCount={pagination.pageCount}
                    hasNext={table.getCanNextPage()}
                    hasPrevious={table.getCanPreviousPage()}
                    previousPage={table.previousPage}
                    nextPage={table.nextPage}
                    pageIndex={table.getState().pagination.pageIndex}
                    setPageIndex={table.setPageIndex}
                  />
                </PaginationContainer>
              </td>
            )}
          </tr>
        </tfoot>
      </StyledTable>
    </Wrapper>
  );
}
