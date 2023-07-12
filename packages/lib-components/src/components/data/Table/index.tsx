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
  ColumnPinningState,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { Wrapper, StyledTable, Header, PaginationContainer } from './style';
import { Dropdown, Empty, IconButton, ToggleButtonGroup } from '../../../components';
import { GenericTextField } from '../../inputs/TextField';
import { Pagination } from './subcomponents';
import {
  AiOutlineFilter as FilterIcon,
  AiOutlinePlus as PlusIcon,
  AiOutlinePicCenter as RelaxedDensityIcon,
  AiOutlinePicRight as TightDensityIcon,
} from 'react-icons/ai';
import { ColumnHeader } from './subcomponents/ColumnHeader';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Density } from '../../../styled';

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
}

export function Table<DataType extends object>({
  data,
  columns,
  sorting,
  defaultDensity = 'tight',
  pagination,
  columnFiltering,
}: TableProps<DataType>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({});
  const [density, setDensity] = useState<Density>(defaultDensity);

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
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,

    initialState: {
      columnVisibility,
      sorting: sorting?.sortingState,
      columnFilters: columnFiltering?.columnFiltersState,
    },

    state: {
      columnVisibility,
      columnOrder,
      sorting: sorting?.sortingState,
      columnFilters: columnFiltering?.columnFiltersState,
      pagination: pagination?.paginationState,
      columnPinning,
    },
  });

  // TODO: add a border outline with an empty table message
  if (data.length === 0) {
    return <Empty header="No data" description="Looks like there is no data" actions={[]} />;
  }

  const [searchContent, setSearchContent] = useState<string>('');
  function parseSearchContent(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchContent(e.target.value);

    // try to split on : and try to match part before : with column id, if found, filter on that column with the rest of the string as value
    const searchParts = e.target.value.split(':');
    if (searchParts.length === 2) {
      const column = table.getAllLeafColumns().find((column) => column.id === searchParts[0]);
      if (column) {
        table.setColumnFilters([{ id: column.id, value: searchParts[1].trim() }]);
        return;
      }
    } else {
      table.setColumnFilters([]);
    }
  }

  return (
    <Wrapper>
      <Header>
        <GenericTextField
          icon={<FilterIcon />}
          onChange={parseSearchContent}
          hasDescription={false}
          value={searchContent}
          name="filter-field"
          id="filter-field"
          hasError={false}
        />
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
                    <Dropdown.Trigger asChild>
                      <IconButton icon={<PlusIcon />} ariaLabel="Change column visibility" />
                    </Dropdown.Trigger>
                    <Dropdown.Menu>
                      <Dropdown.Menu.Group label="Visible columns">
                        {table.getVisibleFlatColumns().map((column) => (
                          <Dropdown.Menu.Item
                            key={column.id}
                            onClick={() => column.toggleVisibility()}
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
                              onClick={() => column.toggleVisibility()}
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
    </Wrapper>
  );
}
