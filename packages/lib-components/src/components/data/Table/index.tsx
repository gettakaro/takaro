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
  getPaginationRowModel,
} from '@tanstack/react-table';
import { Wrapper, AscDescIcon } from './style';
import { Pagination } from './Pagination';

// TODO: add spacing, if you know a table will only have a few rows you can use a more relaxed spacing, if you know it will have a lot of rows you can use a compact spacing.
// TODO: probably add a column filter options
export interface TableProps<DataType extends object> {
  refetching?: boolean;
  data: DataType[];
  // currently not possible to type this properly: https://github.com/TanStack/table/issues/4241
  columns: ColumnDef<DataType, any>[];
  sort?: boolean;
  defaultSorting?: SortingState;

  // pagination

  pagination?: {
    pageIndex: number;
    pageCount: number;
    setPagination: OnChangeFn<PaginationState>;
  };
}

export function Table<DataType extends object>({
  refetching = false,
  data,
  columns,
  sort,
  pagination,
  defaultSorting,
}: TableProps<DataType>) {
  const [sorting, setSorting] = useState<SortingState>(defaultSorting || []);
  const [columnVisibility, setColumnVisibility] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    pageCount: pagination?.pageCount ?? -1,

    manualPagination: false,
    onSortingChange: setSorting,
    onPaginationChange: pagination?.setPagination ?? undefined,
    onColumnVisibilityChange: setColumnVisibility,

    // Reset to the first page when page-altering state changes eg. `data` is updated, filters change, etc
    autoResetPageIndex: true,
    enableSorting: !!sort,
    enableSortingRemoval: false,
    debugTable: true,
    initialState: {
      sorting,
      columnVisibility,
    },
    state: {
      sorting,
      columnVisibility,
    },
  });

  return (
    <Wrapper refetching={refetching}>
      {table.getAllLeafColumns().map((column) => (
        <div key={column.id}>
          <label>
            <input
              type="checkbox"
              checked={column.getIsVisible()}
              onChange={column.getToggleVisibilityHandler()}
            />
            {column.id}
          </label>
        </div>
      ))}
      <table className="w-full min-w-max border-collapse text-left">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(
                ({ id, colSpan, column, isPlaceholder, getContext }) => (
                  <th
                    key={id}
                    colSpan={colSpan}
                    scope="col"
                    onClick={
                      column.columnDef.enableSorting
                        ? column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <div>
                      {isPlaceholder
                        ? null
                        : flexRender(column.columnDef.header, getContext())}

                      {column.getIsSorted() && (
                        <AscDescIcon
                          sorting={column.getIsSorted() as 'asc' | 'desc'}
                        />
                      )}
                    </div>
                  </th>
                )
              )}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="group">
              {row.getVisibleCells().map(({ column, id, getContext }) => (
                <td key={id}>
                  {flexRender(column.columnDef.cell, getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && (
        <Pagination
          pageIndex={table.getState().pagination.pageIndex}
          setPageIndex={table.setPageIndex}
          pageSize={table.getState().pagination.pageSize}
          setPageSize={table.setPageSize}
          previousPage={table.previousPage}
          hasPrevious={table.getCanPreviousPage()}
          nextPage={table.nextPage}
          hasNext={table.getCanNextPage()}
          pageCount={table.getPageCount()}
          isLoading={refetching}
        />
      )}
    </Wrapper>
  );
}
