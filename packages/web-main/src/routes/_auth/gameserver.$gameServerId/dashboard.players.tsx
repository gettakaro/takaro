import { useEffect } from 'react';
import {
  PlayerOnGameserverOutputDTO,
  PlayerOnGameServerSearchInputDTOSortDirectionEnum,
  PlayerOutputDTO,
  EventOutputDTO,
} from '@takaro/apiclient';
import { Card, styled, Table, useTableActions, Chip, CopyId, DateFormatter, Skeleton } from '@takaro/lib-components';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import { Player } from '../../../components/Player';
import { playersOnGameServersQueryOptions } from '../../../queries/pog';
import { useSocket } from '../../../hooks/useSocket';
import { gameServerQueryOptions } from '../../../queries/gameserver';
import { useGameServerDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Duration } from 'luxon';
import {
  AiOutlineUser as UsersIcon,
  AiOutlineCheckCircle as OnlineIcon,
  AiOutlineClockCircle as ClockIcon,
  AiOutlineUserAdd as NewPlayerIcon,
} from 'react-icons/ai';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  height: 100%;
  width: 100%;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing[2]};
`;

const StatCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing[3]};
`;

const StatCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const StatValue = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSize.large};
  font-weight: bold;
`;

const StatLabel = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`;

const StatDescription = styled.p`
  margin: 0;
  margin-top: ${({ theme }) => theme.spacing[1]};
  color: ${({ theme }) => theme.colors.textAlt};
  font-size: ${({ theme }) => theme.fontSize.small};
`;

const TableContainer = styled(Card)`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const TableWrapper = styled.div`
  flex: 1;
  overflow: auto;
`;

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/dashboard/players')({
  loader: async ({ params, context }) => {
    const [gameServer, playersData] = await Promise.all([
      context.queryClient.ensureQueryData(gameServerQueryOptions(params.gameServerId)),
      context.queryClient.ensureQueryData(
        playersOnGameServersQueryOptions({
          filters: { gameServerId: [params.gameServerId] },
          extend: ['player'],
          limit: 25,
        }),
      ),
    ]);
    return { gameServer, playersData };
  },
  component: Component,
  pendingComponent: PendingComponent,
});

function PendingComponent() {
  return (
    <Container>
      <StatsGrid>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" width="100%" height="120px" />
        ))}
      </StatsGrid>
      <Skeleton variant="rectangular" width="100%" height="100%" />
    </Container>
  );
}

function Component() {
  const { gameServerId } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const { socket } = useSocket();

  const { data: gameServer } = useQuery({
    ...gameServerQueryOptions(gameServerId),
    initialData: loaderData.gameServer,
  });

  useGameServerDocumentTitle('players', gameServer);

  const { pagination, columnFilters, sorting, columnSearch } = useTableActions<PlayerOnGameserverOutputDTO>({
    pageSize: 25,
  });

  const { data, isLoading, refetch } = useQuery({
    ...playersOnGameServersQueryOptions({
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
        online: columnFilters.columnFiltersState.find((filter) => filter.id === 'online')?.value?.map(Boolean),
      },
      search: {
        gameId: columnSearch.columnSearchState.find((search) => search.id === 'gameId')?.value,
      },
    }),
    initialData: loaderData.playersData,
  });

  // Real-time updates
  useEffect(() => {
    const handleEvent = (event: EventOutputDTO) => {
      if (event.eventName === 'player-connected' || event.eventName === 'player-disconnected') {
        if (event.gameserverId === gameServerId) {
          refetch();
        }
      }
    };

    socket.on('event', handleEvent);

    return () => {
      socket.off('event', handleEvent);
    };
  }, [socket, gameServerId, refetch]);

  // Calculate statistics
  const totalPlayers = data?.meta.total ?? 0;
  const onlinePlayers = data?.data.filter((p) => p.online).length ?? 0;
  const todayPlayers =
    data?.data.filter((p) => {
      const createdDate = new Date(p.createdAt);
      const today = new Date();
      return createdDate.toDateString() === today.toDateString();
    }).length ?? 0;

  const avgPlaytimeSeconds = data?.data.reduce((sum, p) => sum + p.playtimeSeconds, 0) ?? 0;
  const avgPlaytime =
    totalPlayers > 0
      ? Duration.fromObject({ seconds: avgPlaytimeSeconds / totalPlayers })
          .shiftTo('hours', 'minutes')
          .toHuman({ unitDisplay: 'narrow' })
      : '0h';

  const columnHelper = createColumnHelper<PlayerOnGameserverOutputDTO & { player: PlayerOutputDTO }>();
  const columnDefs = [
    columnHelper.accessor('player.name', {
      header: 'Player',
      id: 'name',
      cell: (info) => {
        const pog = info.row.original;
        const player = pog.player as PlayerOutputDTO;
        return (
          <Player
            playerId={pog.playerId}
            name={player.name}
            showAvatar={true}
            avatarUrl={player.steamAvatar}
            gameServerId={gameServerId}
          />
        );
      },
      enableColumnFilter: false,
      enableSorting: true,
    }),
    columnHelper.accessor('gameId', {
      header: 'Game ID',
      id: 'gameId',
      cell: (info) => <CopyId placeholder={info.getValue()} id={info.getValue()} />,
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('online', {
      header: 'Status',
      id: 'online',
      cell: (info) =>
        info.getValue() ? (
          <Chip variant="outline" color="success" label="Online" />
        ) : (
          <Chip variant="outline" color="secondary" label="Offline" />
        ),
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('ping', {
      header: 'Ping',
      id: 'ping',
      cell: (info) => {
        const ping = info.getValue();
        if (ping === null || ping === undefined) return '-';
        return `${ping}ms`;
      },
      enableColumnFilter: false,
      enableSorting: true,
    }),
    columnHelper.accessor('playtimeSeconds', {
      header: 'Playtime',
      id: 'playtimeSeconds',
      cell: (info) => {
        const seconds = info.getValue();
        return Duration.fromObject({ seconds })
          .shiftTo('days', 'hours', 'minutes')
          .toHuman({ unitDisplay: 'narrow', listStyle: 'narrow' });
      },
      enableColumnFilter: false,
      enableSorting: true,
    }),
    columnHelper.accessor('currency', {
      header: 'Currency',
      id: 'currency',
      cell: (info) => info.getValue().toLocaleString(),
      enableColumnFilter: false,
      enableSorting: true,
    }),
    columnHelper.accessor('createdAt', {
      header: 'First Seen',
      id: 'createdAt',
      meta: { dataType: 'datetime' },
      cell: (info) => <DateFormatter ISODate={info.getValue()} />,
      enableSorting: true,
      enableColumnFilter: false,
    }),
    columnHelper.accessor('lastSeen', {
      header: 'Last Seen',
      id: 'lastSeen',
      meta: { dataType: 'datetime' },
      cell: (info) => <DateFormatter ISODate={info.getValue()} />,
      enableSorting: true,
      enableColumnFilter: false,
    }),
    columnHelper.accessor('positionX', {
      header: 'Position',
      id: 'position',
      cell: (info) => {
        const x = info.row.original.positionX;
        const y = info.row.original.positionY;
        const z = info.row.original.positionZ;
        if (x === null || x === undefined || y === null || y === undefined || z === null || z === undefined) return '-';
        const position = `${Math.round(x)}, ${Math.round(y)}, ${Math.round(z)}`;
        return <CopyId placeholder={position} id={position} />;
      },
      enableColumnFilter: false,
      enableSorting: false,
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
    <Container>
      <StatsGrid>
        <StatCard variant="outline">
          <StatCardHeader>
            <StatLabel>Total Players</StatLabel>
            <UsersIcon size={20} />
          </StatCardHeader>
          <StatValue>{totalPlayers}</StatValue>
          <StatDescription>All time</StatDescription>
        </StatCard>
        <StatCard variant="outline">
          <StatCardHeader>
            <StatLabel>Online Players</StatLabel>
            <OnlineIcon size={20} color={onlinePlayers > 0 ? 'green' : undefined} />
          </StatCardHeader>
          <StatValue>{onlinePlayers}</StatValue>
          <StatDescription>Currently playing</StatDescription>
        </StatCard>
        <StatCard variant="outline">
          <StatCardHeader>
            <StatLabel>New Today</StatLabel>
            <NewPlayerIcon size={20} />
          </StatCardHeader>
          <StatValue>{todayPlayers}</StatValue>
          <StatDescription>First time players</StatDescription>
        </StatCard>
        <StatCard variant="outline">
          <StatCardHeader>
            <StatLabel>Avg. Playtime</StatLabel>
            <ClockIcon size={20} />
          </StatCardHeader>
          <StatValue>{avgPlaytime}</StatValue>
          <StatDescription>Per player</StatDescription>
        </StatCard>
      </StatsGrid>

      <TableContainer variant="outline">
        <TableWrapper>
          <Table
            title="Players"
            id="gameserver-players"
            columns={columnDefs}
            data={(data?.data ?? []) as Array<PlayerOnGameserverOutputDTO & { player: PlayerOutputDTO }>}
            pagination={p}
            columnFiltering={columnFilters}
            columnSearch={columnSearch}
            sorting={sorting}
            isLoading={isLoading}
            searchInputPlaceholder="Search players..."
          />
        </TableWrapper>
      </TableContainer>
    </Container>
  );
}
