import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { itemsQueryOptions } from '../../../queries/item';
import { createColumnHelper, ColumnDef } from '@tanstack/react-table';

import { ItemsOutputDTO, ItemSearchInputDTOSortDirectionEnum } from '@takaro/apiclient';
import { DateFormatter, Table, useTableActions } from '@takaro/lib-components';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/items')({
  component: () => <div>Hello /_auth/gameserver/$gameServerId/items!</div>,
});

export function Component() {
  useDocumentTitle('Items');
  const { pagination, columnFilters, sorting, columnSearch } = useTableActions<ItemsOutputDTO>();

  const { data, isLoading } = useQuery({
    ...itemsQueryOptions({
      page: pagination.paginationState.pageIndex,
      limit: pagination.paginationState.pageSize,
      sortBy: sorting.sortingState[0]?.id,
      sortDirection: sorting.sortingState[0]
        ? sorting.sortingState[0]?.desc
          ? ItemSearchInputDTOSortDirectionEnum.Desc
          : ItemSearchInputDTOSortDirectionEnum.Asc
        : undefined,
      filters: {
        id: columnFilters.columnFiltersState.find((filter) => filter.id === 'key')?.value,
        code: columnFilters.columnFiltersState.find((filter) => filter.id === 'code')?.value,
        name: columnFilters.columnFiltersState.find((filter) => filter.id === 'name')?.value,
        gameserverId: columnFilters.columnFiltersState.find((filter) => filter.id === 'gameserverId')?.value,
      },
      search: {
        id: columnSearch.columnSearchState.find((search) => search.id === 'id')?.value,
        code: columnSearch.columnSearchState.find((search) => search.id === 'code')?.value,
        name: columnSearch.columnSearchState.find((search) => search.id === 'name')?.value,
        gameserverId: columnSearch.columnSearchState.find((search) => search.id === 'gameserverId')?.value,
      },
    }),
  });

  const columnHelper = createColumnHelper<ItemsOutputDTO>();
  const columnDefs: ColumnDef<ItemsOutputDTO, any>[] = [
    columnHelper.accessor('id', {
      header: 'ID',
      id: 'id',
      meta: { dataType: 'string' },
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      id: 'name',
      meta: { dataType: 'string' },
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('code', {
      header: 'Code',
      id: 'code',
      meta: { dataType: 'string' },
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      id: 'description',
      meta: { dataType: 'string' },
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('gameserverId', {
      header: 'gameserverId',
      id: 'game server id',
      meta: { dataType: 'string' },
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created at',
      id: 'createdAt',
      meta: { dataType: 'datetime' },
      cell: (info) => <DateFormatter ISODate={info.getValue()} />,
      enableSorting: true,
    }),
    columnHelper.accessor('updatedAt', {
      header: 'Updated at',
      id: 'updatedAt',
      meta: { dataType: 'datetime', hideColumn: true },
      cell: (info) => <DateFormatter ISODate={info.getValue()} />,
      enableSorting: true,
    }),
  ];

  const p =
    !isLoading && data
      ? {
          paginationState: pagination.paginationState,
          setPaginationState: pagination.setPaginationState,
          pageOptions: pagination.getPageOptions(data),
        }
      : undefined;

  return (
    <Table
      title="List of items"
      id="items"
      columns={columnDefs}
      pagination={p}
      sorting={sorting}
      isLoading={isLoading}
      columnFiltering={columnFilters}
      columnSearch={columnSearch}
      data={data?.data as ItemsOutputDTO[]}
    />
  );
}
