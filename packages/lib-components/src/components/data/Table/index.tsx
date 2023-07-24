import { useEffect, useState } from 'react';
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
  ColumnPinningState,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { Wrapper, StyledTable, Header, PaginationContainer } from './style';
import { Dropdown, IconButton, ToggleButtonGroup } from '../../../components';
import { Pagination } from './subcomponents';
import {
  AiOutlinePlus as PlusIcon,
  AiOutlinePicCenter as RelaxedDensityIcon,
  AiOutlinePicRight as TightDensityIcon,
} from 'react-icons/ai';
import { ColumnHeader } from './subcomponents/ColumnHeader';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Density } from '../../../styled';
import { TableContext } from './Context';
import { useTable } from './useTable';

// TODO: add id so we can save certain data in local storage
export interface TableProps<DataType extends object> {
  data: DataType[];
  defaultDensity?: Density;
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
  columnSearch?: {
    columnSearchState: ColumnFiltersState;
    setColumnSearchState: OnChangeFn<ColumnFiltersState>;
  };
}

export function Table<DataType extends object>({
  data,
  columns,
  sorting,
  defaultDensity = 'tight',
  pagination,
  columnFiltering,
  columnSearch,
}: TableProps<DataType>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({});
  const [density, setDensity] = useState<Density>(defaultDensity);

  const [openColumnVisibilityTooltip, setOpenColumnVisibilityTooltip] = useState<boolean>(false);
  const [hasShownColumnVisibilityTooltip, setHasShownColumnVisibilityTooltip] = useState<boolean>(false);

  // this is a custom hook used in combination with context
  // to pass down table state to bunch of components.
  const manualTableState = useTable();

  useEffect(() => {
    if (
      !hasShownColumnVisibilityTooltip &&
      Object.values(columnVisibility).filter((visible) => visible === false).length === 1
    ) {
      setOpenColumnVisibilityTooltip(true);
      setHasShownColumnVisibilityTooltip(true); // update state to remember that tooltip has been shown

      setTimeout(() => {
        setOpenColumnVisibilityTooltip(false);
      }, 3000);
    }
  }, [columnVisibility, hasShownColumnVisibilityTooltip]); // add hasShownTooltip to the dependency array

  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    columns.map((column) => {
      if (column.id === undefined) {
        throw new Error('ColumnDef must have an id');
      }
      return column.id;
    })
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: pagination?.pageCount ?? -1,

    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,

    enableExpanding: true,
    enableFilters: true,
    enableGlobalFilter: true,

    autoResetPageIndex: false,
    enableSorting: !!sorting,
    enableSortingRemoval: false,
    enableColumnResizing: true,
    enableHiding: true,
    columnResizeMode: 'onChange',
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: sorting?.setSortingState,
    onPaginationChange: pagination?.setPaginationState,
    onColumnFiltersChange: columnFiltering?.setColumnFiltersState,
    onGlobalFilterChange: columnSearch?.setColumnSearchState,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,

    initialState: {
      columnVisibility,
      sorting: sorting?.sortingState,
      columnFilters: columnFiltering?.columnFiltersState,
      globalFilter: columnSearch?.columnSearchState,
    },

    state: {
      columnVisibility,
      columnOrder,
      sorting: sorting?.sortingState,
      columnFilters: columnFiltering?.columnFiltersState,
      globalFilter: columnSearch?.columnSearchState,
      pagination: pagination?.paginationState,
      columnPinning,
    },
  });

  return (
    <Wrapper>
      <TableContext.Provider value={manualTableState}>
        <Header>
          {/* search */}
          <ToggleButtonGroup
            onChange={(val) => setDensity(val as Density)}
            exclusive={true}
            orientation="horizontal"
            defaultValue={density}
          >
            <ToggleButtonGroup.Button value="tight" tooltip="Tight layout">
              <TightDensityIcon size={20} />
            </ToggleButtonGroup.Button>

            <ToggleButtonGroup.Button value="relaxed" tooltip="Relaxed layout">
              <RelaxedDensityIcon size={20} />
            </ToggleButtonGroup.Button>
          </ToggleButtonGroup>
        </Header>

        {/* table */}
        <DndProvider backend={HTML5Backend}>
          <StyledTable density={density}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <ColumnHeader header={header} table={table} key={`draggable-column-header-${header.id}`} />
                  ))}
                  <th colSpan={1}>
                    <Dropdown>
                      <Dropdown.Trigger
                        asChild
                        tooltipOptions={{
                          onOpenChange: setOpenColumnVisibilityTooltip,
                          open: openColumnVisibilityTooltip,
                          content: 'Show or hide columns',
                          placement: 'right',
                        }}
                      >
                        <IconButton icon={<PlusIcon />} ariaLabel="Change column visibility" />
                      </Dropdown.Trigger>
                      <Dropdown.Menu>
                        <Dropdown.Menu.Group label="Visible columns">
                          {table.getVisibleFlatColumns().map((column) => (
                            <Dropdown.Menu.Item
                              key={column.id}
                              onClick={() => {
                                // In case they open the dropdown they already know about the column visibility
                                setHasShownColumnVisibilityTooltip(true);
                                column.toggleVisibility();
                              }}
                              label={column.id}
                              activeStyle="checkbox"
                              active={true}
                            />
                          ))}
                        </Dropdown.Menu.Group>
                        <Dropdown.Menu.Group label="Hidden columns">
                          {table
                            .getAllLeafColumns()
                            .filter((column) => column.getIsVisible() === false)
                            .map((column) => (
                              <Dropdown.Menu.Item
                                key={column.id}
                                onClick={() => {
                                  // In case they open the dropdown they already know about the column visibility
                                  setHasShownColumnVisibilityTooltip(true);
                                  column.toggleVisibility();
                                }}
                                label={column.id}
                                activeStyle="checkbox"
                                active={false}
                              />
                            ))}
                        </Dropdown.Menu.Group>
                      </Dropdown.Menu>
                    </Dropdown>
                  </th>
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(({ column, id, getContext }) => (
                    <td key={id}>{flexRender(column.columnDef.cell, getContext())}</td>
                  ))}
                  {/* Extra column which holds the column-visibilty dropdown*/}
                  <td />

                  {row.getIsExpanded() && (
                    <tr>
                      {/* add + 1 because we have an extra column that holds the column visibility */}
                      <td colSpan={table.getVisibleLeafColumns().length + 1} />
                    </tr>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                {pagination && (
                  <td colSpan={columns.length + 1}>
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
        </DndProvider>
      </TableContext.Provider>
    </Wrapper>
  );
}
