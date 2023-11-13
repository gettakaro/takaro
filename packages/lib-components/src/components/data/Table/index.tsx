import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useSearchParams } from 'react-router-dom';
import { Density } from '../../../styled';
import { useTableSearchParamKeys } from './SearchParams';

import {
  flexRender,
  getCoreRowModel,
  OnChangeFn,
  PaginationState,
  useReactTable,
  ColumnDef,
  SortingState,
  ColumnOrderState,
  VisibilityState,
  ColumnPinningState,
  RowSelectionState,
} from '@tanstack/react-table';
import { Wrapper, StyledTable, Toolbar, PaginationContainer, Flex } from './style';
import { Empty, ToggleButtonGroup } from '../../../components';
import { AiOutlinePicCenter as RelaxedDensityIcon, AiOutlinePicRight as TightDensityIcon } from 'react-icons/ai';
import { ColumnHeader, ColumnVisibility, Filter, Pagination } from './subcomponents';
import { ColumnFilter, PageOptions } from '../../../hooks/useTableActions';
import { GenericCheckBox as CheckBox } from '../../inputs/CheckBox/Generic';
import { useLocalStorage } from '../../../hooks';

export interface TableProps<DataType extends object> {
  /// Unique identifier for the table
  id: string;

  data: DataType[];

  // currently not possible to type this properly: https://github.com/TanStack/table/issues/4241
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<DataType, any>[];

  renderToolbar?: () => JSX.Element;

  /// Callback for when the row selection changes
  rowSelection?: {
    rowSelectionState: RowSelectionState;
    setRowSelectionState: OnChangeFn<RowSelectionState>;
  };

  sorting: {
    sortingState: SortingState;
    setSortingState?: OnChangeFn<SortingState>;
  };

  pagination: {
    paginationState: PaginationState;
    setPaginationState: OnChangeFn<PaginationState>;
    pageOptions: PageOptions;
  };

  columnFiltering: {
    columnFiltersState: ColumnFilter[];
    setColumnFiltersState: Dispatch<SetStateAction<ColumnFilter[]>>;
  };

  columnSearch: {
    columnSearchState: ColumnFilter[];
    setColumnSearchState: OnChangeFn<ColumnFilter[]>;
  };
}

export function Table<DataType extends object>({
  id,
  data,
  columns,
  sorting,
  pagination,
  columnFiltering,
  rowSelection,
  columnSearch,
  renderToolbar,
}: TableProps<DataType>) {
  const TableSearchParamKeys = useTableSearchParamKeys(id);
  const [searchParams, setSearchParams] = useSearchParams();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    const columnVisibility = searchParams.get(TableSearchParamKeys.COLUMN_VISIBILITY);
    return columnVisibility ? JSON.parse(columnVisibility) : {};
  });

  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({});
  const [density, setDensity] = useLocalStorage<Density>(`table-density-${id}`, 'tight');

  const [openColumnVisibilityTooltip, setOpenColumnVisibilityTooltip] = useState<boolean>(false);
  const [hasShownColumnVisibilityTooltip, setHasShownColumnVisibilityTooltip] = useState<boolean>(false);

  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() => {
    const columnOrderString = searchParams.get(TableSearchParamKeys.COLUMN_ORDER);
    if (columnOrderString) {
      return columnOrderString.split(',');
    }

    return columns.map((column) => {
      if (column.id === undefined) {
        throw new Error('ColumnDef must have an id');
      }
      return column.id;
    });
  });

  const ROW_SELECTION_COL_SPAN = rowSelection ? 1 : 0;

  // table size
  useEffect(() => {
    if (density === 'tight') {
      // TODO: this should probably be based on the provided page size
      table.setPageSize(19);
    } else {
      table.resetPageSize(true);
    }
  }, [density]);

  // handles the column visibility tooltip (shows tooltip when the first column is hidden)
  useEffect(() => {
    if (
      !hasShownColumnVisibilityTooltip &&
      Object.values(columnVisibility).filter((visible) => visible === false).length === 1
    ) {
      setOpenColumnVisibilityTooltip(true);
      setHasShownColumnVisibilityTooltip(true);

      setTimeout(() => {
        setOpenColumnVisibilityTooltip(false);
      }, 3000);
    }
  }, [columnVisibility, hasShownColumnVisibilityTooltip]);

  // Function to safely parse search params or use defaults
  const getSafeNumberParam = (paramKey: string, defaultValue: number) => {
    const value = searchParams.get(paramKey);
    return value !== null ? Number(value) : defaultValue;
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    pageCount: pagination?.pageOptions.pageCount ?? -1,

    manualPagination: true,
    paginateExpandedRows: true, // Expanded rows will be paginated this means that rows that take up more space will be shown on next page.
    manualFiltering: true,
    manualSorting: true,
    enableExpanding: true,
    enableFilters: true,
    enableColumnFilters: !!columnFiltering,
    enableGlobalFilter: !!columnSearch,
    enableSorting: !!sorting,
    enableSortingRemoval: false,
    enableColumnResizing: true,
    enableHiding: !!columnVisibility,
    enableRowSelection: !!rowSelection,
    autoResetPageIndex: false,

    columnResizeMode: 'onChange',
    onColumnVisibilityChange: (columnVisibilityOrUpdaterFn) => {
      if (typeof columnVisibilityOrUpdaterFn !== 'function') {
        setSearchParams((prevSearchParams) => {
          prevSearchParams.set(TableSearchParamKeys.COLUMN_VISIBILITY, JSON.stringify(columnVisibilityOrUpdaterFn));
          return prevSearchParams;
        });
        setColumnVisibility(columnVisibilityOrUpdaterFn);
      } else {
        setColumnVisibility((old) => {
          const newColumnVisibility = columnVisibilityOrUpdaterFn(old);
          setSearchParams((prevSearchParams) => {
            prevSearchParams.set(TableSearchParamKeys.COLUMN_VISIBILITY, JSON.stringify(newColumnVisibility));
            return prevSearchParams;
          });
          return newColumnVisibility;
        });
      }
    },

    onSortingChange: (sortingStateOrUpdaterFn) => {
      if (sorting.setSortingState) {
        if (typeof sortingStateOrUpdaterFn !== 'function') {
          setSearchParams((prevSearchParams) => {
            prevSearchParams.set(TableSearchParamKeys.COLUMN_SORT, JSON.stringify(sortingStateOrUpdaterFn));
            return prevSearchParams;
          });
          return sorting?.setSortingState(sortingStateOrUpdaterFn);
        } else {
          sorting?.setSortingState((old) => {
            const newSorting = sortingStateOrUpdaterFn(old);
            setSearchParams((prevSearchParams) => {
              prevSearchParams.set(TableSearchParamKeys.COLUMN_SORT, JSON.stringify(newSorting));
              return prevSearchParams;
            });
            return newSorting;
          });
        }
      }
    },
    onPaginationChange: (paginationOrUpdaterFn) => {
      if (typeof paginationOrUpdaterFn !== 'function') {
        setSearchParams((prevSearchParams) => {
          prevSearchParams.set(TableSearchParamKeys.PAGE_INDEX, String(paginationOrUpdaterFn.pageIndex as number));
          prevSearchParams.set(TableSearchParamKeys.PAGE_SIZE, String(paginationOrUpdaterFn.pageSize));
          return prevSearchParams;
        });
        pagination?.setPaginationState(paginationOrUpdaterFn);
      }
    },
    onColumnFiltersChange: (filtersOrUpdaterFn) => {
      // For some reason the filtersOrUpdaterFn can be a function or the new filters
      if (typeof filtersOrUpdaterFn !== 'function') {
        setSearchParams((prevSearchParams) => {
          prevSearchParams.set(TableSearchParamKeys.COLUMN_FILTER, JSON.stringify(filtersOrUpdaterFn));
          return prevSearchParams;
        });
        columnFiltering?.setColumnFiltersState(filtersOrUpdaterFn as ColumnFilter[]);
      } else {
        columnFiltering?.setColumnFiltersState((old) => {
          const newFilters = filtersOrUpdaterFn(old);
          setSearchParams((prevSearchParams) => {
            prevSearchParams.set(TableSearchParamKeys.COLUMN_FILTER, JSON.stringify(newFilters));
            return prevSearchParams;
          });
          return newFilters as ColumnFilter[];
        });
      }
    },
    onGlobalFilterChange: (filtersOrUpdaterFn) => {
      // Same as column filters
      if (typeof filtersOrUpdaterFn !== 'function') {
        setSearchParams((prevSearchParams) => {
          prevSearchParams.set(TableSearchParamKeys.COLUMN_SEARCH, JSON.stringify(filtersOrUpdaterFn));
          return prevSearchParams;
        });
        columnSearch?.setColumnSearchState(filtersOrUpdaterFn as ColumnFilter[]);
      } else {
        columnSearch?.setColumnSearchState((old) => {
          const newFilters = filtersOrUpdaterFn(old);
          setSearchParams((prevSearchParams) => {
            prevSearchParams.set(TableSearchParamKeys.COLUMN_SEARCH, JSON.stringify(newFilters));
            return prevSearchParams;
          });
          return newFilters as ColumnFilter[];
        });
      }
    },
    onColumnOrderChange: (columnOrderOrUpdaterFn) => {
      if (typeof columnOrderOrUpdaterFn !== 'function') {
        setSearchParams((prevSearchParams) => {
          prevSearchParams.set(TableSearchParamKeys.COLUMN_ORDER, columnOrderOrUpdaterFn.join(','));
          return prevSearchParams;
        });
      }
      setColumnOrder(columnOrderOrUpdaterFn);
    },
    onColumnPinningChange: setColumnPinning,
    onRowSelectionChange: rowSelection ? rowSelection?.setRowSelectionState : undefined,

    // InitialState is only used when a reset is triggered (e.g. resetPageIndex)
    initialState: {
      columnVisibility,
      sorting: [],
      columnFilters: [],
      globalFilter: [],
      pagination: {
        pageIndex: getSafeNumberParam(TableSearchParamKeys.PAGE_INDEX, pagination.paginationState.pageIndex),
        pageSize: getSafeNumberParam(TableSearchParamKeys.PAGE_SIZE, pagination.paginationState.pageSize),
      },
      rowSelection: rowSelection ? rowSelection.rowSelectionState : undefined,
    },

    state: {
      columnVisibility,
      columnOrder,
      sorting: sorting?.sortingState,
      columnFilters: columnFiltering?.columnFiltersState,
      globalFilter: columnSearch?.columnSearchState,
      pagination: pagination.paginationState,
      rowSelection: rowSelection ? rowSelection.rowSelectionState : undefined,
      columnPinning,
    },
  });

  return (
    <Wrapper>
      <Toolbar role="toolbar">
        {/* custom toolbar is rendered on left side*/}
        <Flex>{renderToolbar && renderToolbar()}</Flex>

        <Flex>
          <Filter table={table} tableId={id} />
          <ColumnVisibility
            table={table}
            setHasShownColumnVisibilityTooltip={setHasShownColumnVisibilityTooltip}
            openColumnVisibilityTooltip={openColumnVisibilityTooltip}
            setOpenColumnVisibilityTooltip={setOpenColumnVisibilityTooltip}
            hasShownColumnVisibilityTooltip={hasShownColumnVisibilityTooltip}
          />
          <ToggleButtonGroup
            onChange={(val) => setDensity(val as Density)}
            exclusive={true}
            orientation="horizontal"
            defaultValue={density}
          >
            <ToggleButtonGroup.Button value="relaxed" tooltip="Relaxed layout">
              <RelaxedDensityIcon size={20} />
            </ToggleButtonGroup.Button>
            <ToggleButtonGroup.Button value="tight" tooltip="Tight layout">
              <TightDensityIcon size={20} />
            </ToggleButtonGroup.Button>
          </ToggleButtonGroup>
        </Flex>
      </Toolbar>

      {/* table */}
      <DndProvider backend={HTML5Backend}>
        <StyledTable density={density}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {rowSelection && (
                  <th style={{ width: '10px' }}>
                    <CheckBox
                      hasDescription={false}
                      hasError={false}
                      id={`select-all-header-${headerGroup.id}`}
                      name={`select-all-header-${headerGroup.id}`}
                      onChange={() => table.toggleAllRowsSelected()}
                      size="small"
                      value={table.getIsAllRowsSelected()}
                    />
                  </th>
                )}
                {headerGroup.headers.map((header) => (
                  <ColumnHeader header={header} table={table} key={`draggable-column-header-${header.id}`} />
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {/* empty state */}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={table.getAllColumns().length + ROW_SELECTION_COL_SPAN}>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Empty header="No data" description="We couldn't find what you are looking for." actions={[]} />
                  </div>
                </td>
              </tr>
            )}

            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getCanSelect() && (
                  <td style={{ paddingRight: '10px', width: '15px' }}>
                    <CheckBox
                      value={row.getIsSelected()}
                      id={row.id}
                      name={row.id}
                      hasError={false}
                      disabled={!row.getCanSelect()}
                      onChange={() => row.toggleSelected()}
                      hasDescription={false}
                      size="small"
                    />
                  </td>
                )}
                {row.getVisibleCells().map(({ column, id, getContext }) => (
                  <td key={id}>{flexRender(column.columnDef.cell, getContext())}</td>
                ))}
                {row.getIsExpanded() && (
                  <tr>
                    <td colSpan={table.getVisibleLeafColumns().length} />
                  </tr>
                )}
              </tr>
            ))}
          </tbody>
          {table.getRowModel().rows.length > 1 && (
            <tfoot>
              <tr>
                {pagination && (
                  <td
                    colSpan={
                      columns.length +
                      ROW_SELECTION_COL_SPAN /* +1 here is because we have an extra column for the selection */
                    }
                  >
                    <PaginationContainer>
                      <span>
                        showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
                        {table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                          table.getRowModel().rows.length}{' '}
                        of {pagination.pageOptions.total} entries
                      </span>
                      <Pagination
                        tableId={id}
                        pageCount={table.getPageCount()}
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
          )}
        </StyledTable>
      </DndProvider>
    </Wrapper>
  );
}
