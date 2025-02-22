import { FC, useState } from 'react';
import { PlayerRoleAssignmentOutputDTO } from '@takaro/apiclient';
import { createColumnHelper, CellContext } from '@tanstack/react-table';
import { gameServersQueryOptions } from '../../../../queries/gameserver';
import { AiOutlineDelete as DeleteIcon, AiOutlineRight as ActionIcon, AiOutlineEye as ViewIcon } from 'react-icons/ai';
import { Link, useNavigate } from '@tanstack/react-router';
import { useTableActions, Table, Button, Dropdown, IconButton, Skeleton } from '@takaro/lib-components';
import { DateTime } from 'luxon';
import { useQuery } from '@tanstack/react-query';
import { PlayerRoleDeleteDialog } from '../../../../components/dialogs/PlayerRoleDeleteDialog';

interface IPlayerRolesTableProps {
  roles: PlayerRoleAssignmentOutputDTO[];
  playerId: string;
  playerName: string;
}

export const PlayerRolesTable: FC<IPlayerRolesTableProps> = ({ roles, playerId, playerName }) => {
  const { pagination, columnFilters, sorting, columnSearch } = useTableActions<PlayerRoleAssignmentOutputDTO>();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [deletingInfo, setDeletingInfo] = useState<CellContext<PlayerRoleAssignmentOutputDTO, unknown> | null>(null);
  const navigate = useNavigate();

  const filteredServerIds = roles.filter((role) => role.gameServerId).map((role) => role.gameServerId);

  const { data: gameServers, isLoading } = useQuery(
    gameServersQueryOptions({
      filters: {
        id: filteredServerIds as string[],
      },
    }),
  );

  if (isLoading || !gameServers) {
    return <Skeleton variant="rectangular" width="100%" height="100%" />;
  }

  const columnHelper = createColumnHelper<PlayerRoleAssignmentOutputDTO>();

  const columnDefs = [
    columnHelper.accessor('role.name', {
      header: 'Name',
      id: 'name',
      cell: (info) => (
        <Link to="/roles/view/$roleId" params={{ roleId: info.row.original.roleId }}>
          {info.getValue()}
        </Link>
      ),
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('gameServerId', {
      header: 'Gameserver',
      id: 'gameServerId',
      cell: (info) => {
        const gameServer = gameServers.data.find((server) => server.id === info.getValue());
        return gameServer?.name;
      },
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('expiresAt', {
      header: 'Expires at',
      id: 'expiresAt',
      cell: (info) => {
        const value = info.getValue();
        if (!value) return 'Never';
        const date = DateTime.fromISO(value);
        return date.toLocaleString(DateTime.DATETIME_FULL);
      },
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Assigned at',
      id: 'createdAt',
      cell: (info) => {
        const value = info.getValue();
        if (!value) return 'unknown date';
        const date = DateTime.fromISO(value);
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
              label="View role"
              icon={<ViewIcon />}
              onClick={() =>
                navigate({
                  to: '/roles/view/$roleId',
                  params: { roleId: info.row.original.roleId },
                })
              }
            />
            <Dropdown.Menu.Item
              label="Remove role"
              icon={<DeleteIcon />}
              onClick={() => {
                setOpenDialog(true);
                setDeletingInfo(info);
              }}
              disabled={info.row.original.role.name === 'Player'}
            />
          </Dropdown.Menu>
        </Dropdown>
      ),
    }),
  ];

  return (
    <>
      {deletingInfo && (
        <PlayerRoleDeleteDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          playerId={deletingInfo.row.original.playerId}
          playerName={playerName}
          roleId={deletingInfo.row.original.roleId}
          gameServerId={deletingInfo.row.original.gameServerId}
          roleName={deletingInfo.row.original.role.name}
        />
      )}
      <Table
        title="Player roles Management"
        id="roles"
        columns={columnDefs}
        data={roles}
        renderToolbar={() => (
          <Button
            onClick={() => navigate({ to: '/player/$playerId/role/assign', params: { playerId } })}
            text="Assign role"
          />
        )}
        pagination={{
          paginationState: pagination.paginationState,
          setPaginationState: pagination.setPaginationState,
          pageOptions: { total: roles.length, pageCount: 1 },
        }}
        columnFiltering={columnFilters}
        columnSearch={columnSearch}
        sorting={sorting}
      />
    </>
  );
};
