import { FC, useState } from 'react';
import { PlayerRoleAssignmentOutputDTO } from '@takaro/apiclient';
import { createColumnHelper, CellContext } from '@tanstack/react-table';
import { useGameServers } from 'queries/gameservers';
import { AiOutlineDelete as DeleteIcon, AiOutlineRight as ActionIcon } from 'react-icons/ai';
import { usePlayerRoleUnassign } from 'queries/roles';
import { useNavigate } from 'react-router-dom';
import { StyledDialogBody } from './style';
import { Loading, useTableActions, Table, Button, Dropdown, IconButton, Dialog } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { DateTime } from 'luxon';

const AssignRole: FC<{ playerId: string }> = ({ playerId }) => {
  const navigate = useNavigate();
  return <Button onClick={() => navigate(PATHS.player.assignRole(playerId))} text="Assign role" />;
};

interface IPlayerRolesTableProps {
  roles: PlayerRoleAssignmentOutputDTO[];
  playerId: string;
  playerName: string;
}

export const PlayerRolesTable: FC<IPlayerRolesTableProps> = ({ roles, playerId, playerName }) => {
  const { pagination, columnFilters, sorting, columnSearch } = useTableActions<PlayerRoleAssignmentOutputDTO>();
  const { mutate } = usePlayerRoleUnassign();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [deletingInfo, setDeletingInfo] = useState<CellContext<PlayerRoleAssignmentOutputDTO, unknown> | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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

  const columnHelper = createColumnHelper<PlayerRoleAssignmentOutputDTO>();

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
                setOpenDialog(true);
                setDeletingInfo(info);
              }}
            />
          </Dropdown.Menu>
        </Dropdown>
      ),
    }),
  ];

  const handleOnDelete = async () => {
    if (deletingInfo) {
      setIsDeleting(true);
      mutate({
        id: playerId,
        roleId: deletingInfo.row.original.role.id,
        gameServerId: deletingInfo.row.original.gameServerId,
      });
      setIsDeleting(false);
      setOpenDialog(false);
    }
  };

  return (
    <>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <Dialog.Content>
          <Dialog.Heading>
            Role: <span style={{ textTransform: 'capitalize' }}>{deletingInfo?.row.original.role.name}</span>{' '}
          </Dialog.Heading>
          <StyledDialogBody size="medium">
            <h2>Unassign Role</h2>
            <p>
              Are you sure you want to unassign <strong>{deletingInfo?.row.original.role.name} </strong> from{' '}
              <strong>{playerName}</strong>?
            </p>
            <Button
              isLoading={isDeleting}
              onClick={() => handleOnDelete()}
              fullWidth
              text={'Unassign role'}
              color="error"
            />
          </StyledDialogBody>
        </Dialog.Content>
      </Dialog>

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
    </>
  );
};
