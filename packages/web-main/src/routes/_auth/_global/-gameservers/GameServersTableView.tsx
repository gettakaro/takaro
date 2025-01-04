import { GameServerOutputDTO, GameServerSearchInputDTOSortDirectionEnum } from '@takaro/apiclient';
import { Chip, Table, useTableActions } from '@takaro/lib-components';
import { useQuery } from '@tanstack/react-query';
import { gameServersQueryOptions } from 'queries/gameserver';
import { createColumnHelper } from '@tanstack/react-table';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { GameServerActions } from '../gameservers';

export const GameServersTableView = () => {
  const [quickSearchInput, setQuickSearchInput] = useState<string>('');
  const { pagination, columnFilters, sorting, columnSearch } = useTableActions<GameServerOutputDTO>({
    pageSize: 25,
  });

  const { data, isLoading } = useQuery({
    ...gameServersQueryOptions({
      limit: pagination.paginationState.pageSize,
      sortBy: sorting.sortingState[0]?.id,
      sortDirection: sorting.sortingState[0]?.desc
        ? GameServerSearchInputDTOSortDirectionEnum.Desc
        : GameServerSearchInputDTOSortDirectionEnum.Asc,
      filters: {
        id: columnFilters.columnFiltersState.find((filter) => filter.id === 'id')?.value,
        name: columnFilters.columnFiltersState.find((filter) => filter.id === 'name')?.value,
      },
      search: {
        name: [
          ...(columnFilters.columnFiltersState.find((filter) => filter.id === 'name')?.value ?? []),
          quickSearchInput,
        ],
      },
    }),
  });

  const columnHelper = createColumnHelper<GameServerOutputDTO>();
  const columnDefs = [
    columnHelper.accessor('id', {
      id: 'id',
      header: 'Game Server Id',
      cell: (info) => info.getValue(),
      meta: {
        hideColumn: true,
      },
    }),
    columnHelper.accessor('name', {
      id: 'name',
      header: 'Name',
      cell: (info) => (
        <Link
          className="underline"
          to="/gameserver/$gameServerId/dashboard/overview"
          params={{ gameServerId: info.row.original.id }}
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor('type', {
      id: 'type',
      header: 'Game Server Type',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('enabled', {
      id: 'enabled',
      header: 'Status',
      cell: (info) =>
        info.getValue() ? (
          <Chip variant="outline" color="success" label="Enabled" />
        ) : (
          <Chip variant="outline" color="error" label="Disabled" />
        ),
    }),
    columnHelper.accessor('reachable', {
      id: 'reachable',
      header: 'Reachable',
      cell: (info) =>
        info.getValue() ? (
          <Chip variant="outline" color="success" label="Online" />
        ) : (
          <Chip variant="outline" color="error" label="Offline" />
        ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        return <GameServerActions gameServerId={info.row.original.id} gameServerName={info.row.original.name} />;
      },
      enableColumnFilter: false,
      enableHiding: false,
      enablePinning: false,
      enableGrouping: false,
      enableResizing: false,
      maxSize: 40,
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
      title="Game servers"
      id="gameservers"
      columns={columnDefs}
      searchInputPlaceholder="Search gameserver by name..."
      onSearchInputChanged={setQuickSearchInput}
      isLoading={isLoading}
      pagination={p}
      columnSearch={columnSearch}
      columnFiltering={columnFilters}
      sorting={sorting}
      data={data?.data as GameServerOutputDTO[]}
    />
  );
};
