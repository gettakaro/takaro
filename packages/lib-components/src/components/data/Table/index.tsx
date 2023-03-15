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
} from '@tanstack/react-table';
import { Wrapper, StyledTable, FilterContainer, Header } from './style';
import { ColumnFilters } from './ColumnFilters';
import { Empty, Dropdown, Button, IconButton } from '../../../components';
import { AiOutlineFilter as Filter } from 'react-icons/ai';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Pagination } from './Pagination';
import { SortAndOrder } from './SortAndOrder';

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
    pageCount: number;
    setPaginationState: OnChangeFn<PaginationState>;
    total: number;
  };
  columnFiltering?: {
    columnFiltersState: ColumnFiltersState;
    setColumnFiltersState: OnChangeFn<ColumnFiltersState>;
  };
}

export function Table<DataType extends object>({
  refetching = false,
  data,
  columns,
  sorting,
  spacing = 'tight',
  pagination,
  columnFiltering,
}: TableProps<DataType>) {
  const [showFilters, setShowFilters] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);

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
    debugTable: true,
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

  // empty table
  // TODO: add a border outline with an empty table message
  if (data.length === 0) {
    return <Empty />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Wrapper refetching={refetching}>
        <Header>
          {/* filter menu */}
          <Button
            icon={<Filter />}
            text="Filters"
            color="background"
            onClick={() => setShowFilters(!showFilters)}
          />
          <SortAndOrder
            columns={table.getAllLeafColumns()}
            setColumnOrder={setColumnOrder}
            columnOrder={columnOrder}
          />
        </Header>

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
                      {!isPlaceholder &&
                        flexRender(column.columnDef.header, getContext())}

                      {column.getCanSort() && (
                        <Dropdown
                          renderReference={
                            <IconButton
                              icon={<Filter />}
                              size="tiny"
                              color="secondary"
                            />
                          }
                          renderFloating={
                            <ul>
                              <li>Filter 1</li>
                              <li>Filter 2</li>
                              <li>Filter 3</li>
                            </ul>
                          }
                        />
                      )}
                    </th>
                  )
                )}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map(({ column, id, getContext }) => (
                  <td key={id}>
                    {flexRender(column.columnDef.cell, getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            {pagination && (
              <>
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
              </>
            )}
          </tfoot>
        </StyledTable>
      </Wrapper>
    </DndProvider>
  );
}
