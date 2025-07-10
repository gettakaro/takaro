import { useEffect } from 'react';
import {
  PlayerOnGameserverOutputDTO,
  PlayerOnGameServerSearchInputDTOSortDirectionEnum,
  PlayerOutputDTO,
  EventOutputDTO,
  PlayerOnGameServerSearchInputDTOExtendEnum,
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
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [gameServer, playersData, onlinePlayersData, todayPlayersData] = await Promise.all([
      context.queryClient.ensureQueryData(gameServerQueryOptions(params.gameServerId)),
      context.queryClient.ensureQueryData(
        playersOnGameServersQueryOptions({
          filters: { gameServerId: [params.gameServerId] },
          extend: ['player'],
          limit: 25,
        }),
      ),
      // Query for online players count
      context.queryClient.ensureQueryData(
        playersOnGameServersQueryOptions({
          filters: {
            gameServerId: [params.gameServerId],
            online: [true],
          },
          limit: 1, // We only need the meta.total
        }),
      ),
      // Query for players who joined today
      context.queryClient.ensureQueryData(
        playersOnGameServersQueryOptions({
          filters: { gameServerId: [params.gameServerId] },
          greaterThan: { createdAt: startOfToday.toISOString() },
          limit: 1, // We only need the meta.total
        }),
      ),
    ]);
    return { gameServer, playersData, onlinePlayersData, todayPlayersData };
  },
  component: Component,
  pendingComponent: PendingComponent,
});

function PendingComponent() {
  return (
    <Container>
      <StatsGrid>
        {[...Array(3)].map((_, i) => (
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

  const queryParams = {
    page: pagination.paginationState.pageIndex,
    limit: pagination.paginationState.pageSize,
    extend: [PlayerOnGameServerSearchInputDTOExtendEnum.Player],
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
  };

  const { data, isLoading, refetch } = useQuery({
    ...playersOnGameServersQueryOptions(queryParams),
    // Only use initialData if the query params match the initial load
    initialData:
      pagination.paginationState.pageIndex === 0 && columnFilters.columnFiltersState.length === 0
        ? loaderData.playersData
        : undefined,
  });

  // Query for online players count
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { data: onlinePlayersData, refetch: refetchOnlinePlayers } = useQuery({
    ...playersOnGameServersQueryOptions({
      filters: {
        gameServerId: [gameServerId],
        online: [true],
      },
      limit: 1,
    }),
    initialData: loaderData.onlinePlayersData,
  });

  // Query for today's new players
  const { data: todayPlayersData, refetch: refetchTodayPlayers } = useQuery({
    ...playersOnGameServersQueryOptions({
      filters: { gameServerId: [gameServerId] },
      greaterThan: { createdAt: startOfToday.toISOString() },
      limit: 1,
    }),
    initialData: loaderData.todayPlayersData,
  });

  // Real-time updates
  useEffect(() => {
    const handleEvent = (event: EventOutputDTO) => {
      if (event.eventName === 'player-connected' || event.eventName === 'player-disconnected') {
        if (event.gameserverId === gameServerId) {
          refetch();
          refetchOnlinePlayers();
          refetchTodayPlayers();
        }
      }
    };

    socket.on('event', handleEvent);

    return () => {
      socket.off('event', handleEvent);
    };
  }, [socket, gameServerId, refetch, refetchOnlinePlayers, refetchTodayPlayers]);

  // Calculate statistics
  const totalPlayers = data?.meta.total ?? 0;
  const onlinePlayers = onlinePlayersData?.meta.total ?? 0;
  const todayPlayers = todayPlayersData?.meta.total ?? 0;

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
          pageOptions: pagination.getPageOptions(data!),
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
      </StatsGrid>

      <TableContainer variant="outline">
        <TableWrapper>
          <Table
            title="Players"
            id="gameserver-players"
            columns={columnDefs}
            data={(data?.data as any) ?? []}
            pagination={p}
            columnFiltering={columnFilters}
            columnSearch={columnSearch}
            sorting={sorting}
            isLoading={isLoading}
          />
        </TableWrapper>
      </TableContainer>
    </Container>
  );
}
