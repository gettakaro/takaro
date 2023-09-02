import { RoleAssignmentOutputDTO } from '@takaro/apiclient';
import { Loading, useTableActions, Table, Button, Dropdown, IconButton, Divider } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { usePlayer } from 'queries/players';
import { FC } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { createColumnHelper } from '@tanstack/react-table';
import { useGameServers } from 'queries/gameservers';
import { DateTime } from 'luxon';
import { AiOutlineDelete as DeleteIcon, AiOutlineRight as ActionIcon } from 'react-icons/ai';
import { usePlayerRoleUnassign } from 'queries/roles';

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
        <li>Created at: {DateTime.fromISO(data?.createdAt).toLocaleString(DateTime.DATETIME_FULL)}</li>
        <li>Updated at: {DateTime.fromISO(data?.updatedAt).toLocaleString(DateTime.DATETIME_FULL)}</li>
        <li>Steam ID: {data?.steamId}</li>
        <li>EOS ID: {data?.epicOnlineServicesId}</li>
        <li>Xbox ID: {data?.xboxLiveId}</li>
      </ul>

      <Divider />

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
  const { mutate } = usePlayerRoleUnassign();

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
    columnHelper.display({
      header: 'Actions',
      id: 'actions',
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: false,
      enablePinning: false,
      enableGlobalFilter: false,
      enableResizing: false,
      maxSize: 50,

      cell: (info) => (
        <Dropdown>
          <Dropdown.Trigger asChild>
            <IconButton icon={<ActionIcon />} ariaLabel="player-actions" />
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Menu.Item
              label="Unassign role"
              icon={<DeleteIcon />}
              onClick={() => {
                mutate({
                  id: playerId,
                  roleId: info.row.original.role.id,
                  gameServerId: info.row.original.gameServerId,
                });
              }}
            />
          </Dropdown.Menu>
        </Dropdown>
      ),
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
