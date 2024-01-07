import { UserAssignmentOutputDTO, UserOutputWithRolesDTO } from '@takaro/apiclient';
import { Button, Divider, Dropdown, IconButton, Skeleton, Table, useTableActions } from '@takaro/lib-components';
import { useUser, useUserRemoveRole } from 'queries/users';
import { createColumnHelper } from '@tanstack/react-table';
import { FC } from 'react';
import { useParams, Outlet, useNavigate } from 'react-router-dom';
import { DateTime } from 'luxon';
import { PATHS } from 'paths';
import { AiOutlineDelete as DeleteIcon, AiOutlineRight as ActionIcon } from 'react-icons/ai';

export const UserProfile: FC = () => {
  const { userId } = useParams();
  const { data, isLoading } = useUser(userId!);

  if (isLoading) {
    return <Skeleton variant="rectangular" width="100%" height="100%" />;
  }

  return <UserProfilePage user={data!} />;
};

interface UserProfileProps {
  user: UserOutputWithRolesDTO;
}

const UserProfilePage: FC<UserProfileProps> = ({ user }) => {
  return (
    <div>
      <h1>{user.name}</h1>
      <ul>
        <li>Takaro ID: {user.id}</li>
        <li>Created at: {DateTime.fromISO(user?.createdAt).toLocaleString(DateTime.DATETIME_FULL)}</li>
        <li>Updated at: {DateTime.fromISO(user?.updatedAt).toLocaleString(DateTime.DATETIME_FULL)}</li>
        <li>Email: {user.email}</li>
        <li>Discord ID: {user.discordId}</li>
      </ul>

      <Divider />

      <h2>Roles</h2>

      <UserRolesTable roles={user.roles} userId={user.id} />

      <Outlet />
    </div>
  );
};

const AssignRole: FC<{ userId: string }> = ({ userId }) => {
  const navigate = useNavigate();

  return <Button onClick={() => navigate(PATHS.user.assignRole(userId))} text="Assign role" />;
};

interface IUserRolesTableProps {
  roles: UserAssignmentOutputDTO[];
  userId: string;
}

const UserRolesTable: FC<IUserRolesTableProps> = ({ roles, userId }) => {
  const { pagination, columnFilters, sorting, columnSearch } = useTableActions<UserAssignmentOutputDTO>();
  const { mutate } = useUserRemoveRole();

  const columnHelper = createColumnHelper<UserAssignmentOutputDTO>();

  const columnDefs = [
    columnHelper.accessor('role.name', {
      header: 'Name',
      id: 'name',
      cell: (info) => info.getValue(),
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
                  userId,
                  roleId: info.row.original.roleId,
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
      id="userRoles"
      columns={columnDefs}
      data={roles}
      renderToolbar={() => <AssignRole userId={userId} />}
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
