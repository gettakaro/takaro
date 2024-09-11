import {
  ModuleInstallationOutputDTO,
  ShopListingOutputDTO,
  ShopListingSearchInputDTOSortDirectionEnum,
} from '@takaro/apiclient';
import { Table, useTableActions } from '@takaro/lib-components';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { gameServerModuleInstallationOptions } from 'queries/gameserver';
import { ModuleViewProps } from '../../modules';

export const ModulesTableView: FC<ModuleViewProps> = ({ installations, modules, gameServerId }) => {
  const { pagination, columnFilters, sorting, columnSearch } = useTableActions<ShopListingOutputDTO>({ pageSize: 25 });
  const { data, isLoading } = useQuery(
    gameServerModuleInstallationOptions({
      page: pagination.paginationState.pageIndex,
      limit: pagination.paginationState.pageSize,
      sortBy: sorting.sortingState[0]?.id,
      sortDirection: sorting.sortingState[0]?.desc
        ? ShopListingSearchInputDTOSortDirectionEnum.Desc
        : ShopListingSearchInputDTOSortDirectionEnum.Asc,
      filters: {
        id: columnFilters.columnFiltersState.find((filter) => filter.id === 'id')?.value,
        name: columnFilters.columnFiltersState.find((filter) => filter.id === 'name')?.value,
        gameServerId: [gameServerId],
      },
      search: {},
    }),
  );

  const columnHelper = createColumnHelper<ModuleInstallationOutputDTO>();
  const columnDefs = [
    columnHelper.accessor('id', {
      header: 'ID',
      id: 'id',
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('module.name', {
      header: 'name',
      id: 'module.name',
      enableColumnFilter: false,
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('module.hooks', {
      header: 'Amount of hooks',
      id: 'module.hooks',
      enableColumnFilter: false,
      cell: (info) => info.getValue().length,
    }),
    columnHelper.accessor('module.commands', {
      header: 'Amount of commands',
      id: 'module.commands',
      enableColumnFilter: false,
      cell: (info) => info.getValue().length,
    }),
    columnHelper.accessor('module.cronJobs', {
      header: 'Amount of cronjobs',
      id: 'module.cronjobs',
      enableColumnFilter: false,
      cell: (info) => info.getValue().length,
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
      title="Modules"
      id="module-installation-table"
      columns={columnDefs}
      data={data?.data}
      pagination={p}
      columnFiltering={columnFilters}
      columnSearch={columnSearch}
      sorting={sorting}
      isLoading={isLoading}
    />
  );
};
