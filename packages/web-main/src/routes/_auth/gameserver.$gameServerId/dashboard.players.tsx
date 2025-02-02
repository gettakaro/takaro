import {
  PlayerOnGameserverOutputDTO,
  PlayerOnGameServerSearchInputDTOSortDirectionEnum,
  PlayerOutputDTO,
} from '@takaro/apiclient';
import { Chip, CopyId, DateFormatter, styled, Table, useTableActions } from '@takaro/lib-components';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import { Player } from 'components/Player';
import { playersOnGameServersQueryOptions } from 'queries/pog';

const Container = styled.div`
  display: grid;
  grid-template-columns: 2fr;
  align-items: stretch;
  flex-wrap: wrap;
  height: 100%;
  width: 100%;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/dashboard/players')({
  component: Component,
});

function Component() {
  const { gameServerId } = Route.useParams();
  const { pagination, columnFilters, sorting, columnSearch } = useTableActions<PlayerOnGameserverOutputDTO>({
    pageSize: 25,
  });
  const { data, isLoading } = useQuery(
    playersOnGameServersQueryOptions({
      page: pagination.paginationState.pageIndex,
      limit: pagination.paginationState.pageSize,
      extend: ['player'],
      sortBy: sorting.sortingState[0]?.id,
      sortDirection: sorting.sortingState[0]?.desc
        ? PlayerOnGameServerSearchInputDTOSortDirectionEnum.Desc
        : PlayerOnGameServerSearchInputDTOSortDirectionEnum.Asc,
      filters: {
        gameServerId: [gameServerId],
        gameId: columnFilters.columnFiltersState.find((filter) => filter.id === 'gameId')?.value,
        online: columnFilters.columnFiltersState.find((filter) => filter.id === 'online')?.value.map(Boolean),
      },
    }),
  );

  const columnHelper = createColumnHelper<PlayerOnGameserverOutputDTO & { player: PlayerOutputDTO }>();
  const columnDefs = [
    columnHelper.accessor('player.name', {
      header: 'Name',
      id: 'name',
      cell: (info) => {
        const name = info.getValue();
        if (!name) return '';

        const pog = info.row.original;
        return (
          <Player playerId={pog.playerId} name={pog.player.name} showAvatar={true} avatarUrl={pog.player.steamAvatar} />
        );
      },
      enableColumnFilter: false,
      enableSorting: false,
    }),
    columnHelper.accessor('gameId', {
      header: 'Game ID',
      id: 'gameId',
      cell: (info) => <CopyId placeholder={info.getValue()} id={info.getValue()} />,
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created at',
      id: 'createdAt',
      meta: { dataType: 'datetime' },
      cell: (info) => <DateFormatter ISODate={info.getValue()} />,
      enableSorting: true,
      enableColumnFilter: false,
    }),
    columnHelper.accessor('updatedAt', {
      header: 'Updated at',
      id: 'updatedAt',
      meta: { dataType: 'datetime', hideColumn: true },
      cell: (info) => <DateFormatter ISODate={info.getValue()} />,
      enableSorting: true,
      enableColumnFilter: false,
    }),
    columnHelper.accessor('ping', {
      header: 'Ping',
      id: 'ping',
      cell: (info) => `${info.getValue()} ms`,
      enableColumnFilter: false,
      enableSorting: true,
    }),

    columnHelper.accessor('online', {
      header: 'Status',
      id: 'online',
      meta: { dataType: 'boolean' },
      cell: (info) =>
        info.getValue() ? (
          <Chip variant="outline" color="success" label="Online" />
        ) : (
          <Chip variant="outline" color="success" label="Offline" />
        ),
      enableColumnFilter: false,
      enableSorting: true,
    }),

    columnHelper.accessor('lastSeen', {
      header: 'Last Seen',
      id: 'lastSeen',
      meta: { dataType: 'datetime' },
      cell: (info) => <DateFormatter ISODate={info.getValue()} />,
      enableSorting: true,
    }),

    columnHelper.accessor('playtimeSeconds', {
      header: 'Playtime',
      id: 'playtimeSeconds',
      cell: (info) => {
        const seconds = info.getValue();
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
      },
      enableColumnFilter: true,
      enableSorting: true,
    }),

    columnHelper.accessor('currency', {
      header: 'Currency',
      id: 'currency',
      cell: (info) => info.getValue().toLocaleString(),
      enableColumnFilter: true,
      enableSorting: true,
    }),

    columnHelper.accessor('positionX', {
      header: 'Position',
      id: 'position',
      cell: (info) => {
        const x = info.row.original.positionX;
        const y = info.row.original.positionY;
        const z = info.row.original.positionZ;
        const position = `${x}, ${y}, ${z}`;
        return <CopyId placeholder={position} id={position} />;
      },
      enableColumnFilter: false,
      enableSorting: false,
    }),
  ];

  // since pagination depends on data, we need to make sure that data is not undefined
  const p =
    !isLoading && data
      ? {
          paginationState: pagination.paginationState,
          setPaginationState: pagination.setPaginationState,
          pageOptions: pagination.getPageOptions(data),
        }
      : undefined;

  return (
    <Container>
      <Table
        title="List of players"
        id="players"
        columns={columnDefs}
        data={data?.data as unknown as Array<PlayerOnGameserverOutputDTO & { player: PlayerOutputDTO }>}
        pagination={p}
        columnFiltering={columnFilters}
        columnSearch={columnSearch}
        sorting={sorting}
        isLoading={isLoading}
        searchInputPlaceholder="Search player by name..."
      />
    </Container>
  );
}
