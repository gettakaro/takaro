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
import { Dropdown, Empty, IconButton } from '../../../components';
import { GenericTextField } from '../../inputs/TextField';
import { Pagination } from './subcomponents';
import {
  AiOutlineMenu as MenuIcon,
  AiOutlineSortAscending as SortAscendingIcon,
  AiOutlineSortDescending as SortDescendingIcon,
  AiOutlineEyeInvisible as HideFieldIcon,
  AiOutlineFilter as FilterIcon,
} from 'react-icons/ai';

// TODO: add id so we can save certain data in local storage
export interface TableProps<DataType extends object> {
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
    onColumnFiltersChange: () => columnFiltering?.setColumnFiltersState ?? undefined,
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
      columnFilters: columnFiltering?.columnFiltersState,
      pagination: pagination?.paginationState,
    },
  });

  const toggleSorting = (columnId: string, desc: boolean) => {
    table.setSorting(() => [{ id: columnId, desc }]);
  };

  // TODO: add a border outline with an empty table message
  if (data.length === 0) {
    return <Empty header="No data" description="Looks like there is no data" actions={[]} />;
  }

  function getSortingToggle(columnId: string) {
    const sort = table.getState().sorting.find((sort) => sort.id === columnId);
    if (sort) {
      if (sort.desc) {
        return (
          <IconButton
            icon={<SortDescendingIcon />}
            ariaLabel="toggle to ascending"
            onClick={() => toggleSorting(columnId, false)}
          />
        );
      } else {
        return (
          <IconButton
            icon={<SortAscendingIcon />}
            ariaLabel="toggle to descending"
            onClick={() => toggleSorting(columnId, true)}
          />
        );
      }
    }
    return <></>;
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
      </Header>

      {/* table */}
      <StyledTable spacing={spacing}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(({ id, colSpan, column }) => (
                <th key={id} colSpan={colSpan} scope="col">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      {column.columnDef.header?.toString()}

                      {getSortingToggle(column.id)}
                    </span>
                    <Dropdown>
                      <Dropdown.Trigger asChild>
                        <IconButton icon={<MenuIcon />} ariaLabel="column settings" />
                      </Dropdown.Trigger>
                      <Dropdown.Menu>
                        <Dropdown.Menu.Group divider>
                          <Dropdown.Menu.Item
                            icon={<SortAscendingIcon />}
                            onClick={() => {
                              if (table.getState().sorting.some((sort) => sort.id === column.id && !sort.desc)) {
                                // remove sorting
                                table.setSorting((prev) => prev.filter((sort) => sort.id !== column.id));
                              } else {
                                toggleSorting(column.id, false);
                                /* TODO: WHENEVER sorting multiple columns at once is supported, should first, try to find the id, update if found, add if not found*/
                                //table.setSorting((prev) => [...prev, { id: column.id, desc: false }]);
                              }
                            }}
                            active={table.getState().sorting.some((sort) => sort.id === column.id && !sort.desc)}
                            label="Sort ascending (A..Z)"
                            disabled={!column.getCanSort()}
                          />
                          <Dropdown.Menu.Item
                            icon={<SortDescendingIcon />}
                            onClick={() => {
                              if (table.getState().sorting.some((sort) => sort.id === column.id && sort.desc)) {
                                // remove sorting
                                table.setSorting((prev) => prev.filter((sort) => sort.id !== column.id));
                              } else {
                                toggleSorting(column.id, true);
                              }
                            }}
                            disabled={!column.getCanSort()}
                            active={table.getState().sorting.some((sort) => sort.id === column.id && sort.desc)}
                            label="Sort descending (Z..A)"
                          />
                          <Dropdown.Menu.Item
                            icon={<FilterIcon />}
                            label="Filter by values"
                            disabled={!column.getCanFilter()}
                            onClick={() => setSearchContent(`${column.id}:`)}
                          />
                        </Dropdown.Menu.Group>
                        <Dropdown.Menu.Item
                          icon={<HideFieldIcon />}
                          disabled={!column.getCanHide()}
                          onClick={() => {
                            column.toggleVisibility(false);
                          }}
                          label="Hide field"
                        />
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
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
