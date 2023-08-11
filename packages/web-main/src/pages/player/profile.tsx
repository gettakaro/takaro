import { RoleAssignmentOutputDTO } from '@takaro/apiclient';
import { Loading, useTableActions, Table, Button } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { usePlayer } from 'queries/players';
import { FC } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { createColumnHelper } from '@tanstack/react-table';
import { useGameServers } from 'queries/gameservers';
import { DateTime } from 'luxon';

export const PlayerProfile: FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  if (!playerId) {
    navigate(PATHS.players());
    return <Loading />;
  }

  const { data, isLoading } = usePlayer(playerId);

  if (isLoading || !data) {
    return <Loading />;
  }

  return (
    <div>
      <h1>{data?.name}</h1>
      <ul>
        <li>Takaro ID: {data?.id}</li>
        <li>Created at: {data?.createdAt}</li>
        <li>Updated at: {data?.updatedAt}</li>
        <li>Steam ID: {data?.steamId}</li>
        <li>EOS ID: {data?.epicOnlineServicesId}</li>
        <li>Xbox ID: {data?.xboxLiveId}</li>
      </ul>
      <h2>Roles</h2>

      <PlayerRolesTable roles={data?.roleAssignments} playerId={playerId} />
      <Outlet />
    </div>
  );
};

const AssignRole: FC<{ playerId: string }> = ({ playerId }) => {
  const navigate = useNavigate();

  return <Button onClick={() => navigate(PATHS.player.assignRole(playerId))} text="Assign role" />;
};

interface IPlayerRolesTableProps {
  roles: RoleAssignmentOutputDTO[];
  playerId: string;
}

const PlayerRolesTable: FC<IPlayerRolesTableProps> = ({ roles, playerId }) => {
  const { pagination, columnFilters, sorting, columnSearch } = useTableActions<RoleAssignmentOutputDTO>();

  const filteredServerIds = roles.filter((role) => role.gameServerId).map((role) => role.gameServerId);

  const { data, isLoading } = useGameServers({
    filters: {
      id: filteredServerIds as string[],
    },
  });

  if (isLoading || !data) {
    return <Loading />;
  }

  const gameServers = data?.pages.flatMap((page) => page.data);

  const columnHelper = createColumnHelper<RoleAssignmentOutputDTO>();

  const columnDefs = [
    columnHelper.accessor('role.name', {
      header: 'Name',
      id: 'name',
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('gameServerId', {
      header: 'Gameserver',
      id: 'gameServerId',
      cell: (info) => {
        const gameServer = gameServers.find((server) => server.id === info.getValue());
        return gameServer?.name;
      },
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Assigned at',
      id: 'createdAt',
      cell: (info) => {
        const date = DateTime.fromISO(info.getValue());
        return date.toLocaleString(DateTime.DATETIME_FULL);
      },
      enableColumnFilter: true,
      enableSorting: true,
    }),
  ];

  return (
    <Table
      id="players"
      columns={columnDefs}
      data={roles}
      renderToolbar={() => <AssignRole playerId={playerId} />}
      pagination={{
        paginationState: pagination.paginationState,
        setPaginationState: pagination.setPaginationState,
        pageOptions: { total: roles.length, pageCount: 1 },
      }}
      columnFiltering={columnFilters}
      columnSearch={columnSearch}
      sorting={sorting}
    />
  );
};
