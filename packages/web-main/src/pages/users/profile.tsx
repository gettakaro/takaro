import { RoleOutputDTO, UserOutputWithRolesDTO } from '@takaro/apiclient';
import { Button, Divider, Loading, Table, useTableActions } from '@takaro/lib-components';
import { useUser } from 'queries/users/queries';
import { createColumnHelper } from '@tanstack/react-table';
import { FC } from 'react';
import { useParams, Outlet, useNavigate } from 'react-router-dom';
import { DateTime } from 'luxon';
import { PATHS } from 'paths';

export const UserProfile: FC = () => {
  const { userId } = useParams();
  const { data, isLoading } = useUser(userId!);

  if (isLoading) {
    return <Loading />;
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
  roles: RoleOutputDTO[];
  userId: string;
}

const UserRolesTable: FC<IUserRolesTableProps> = ({ roles, userId }) => {
  const { pagination, columnFilters, sorting, columnSearch } = useTableActions<RoleOutputDTO>();

  const columnHelper = createColumnHelper<RoleOutputDTO>();

  const columnDefs = [
    columnHelper.accessor('name', {
      header: 'Name',
      id: 'name',
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
      enableSorting: true,
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
