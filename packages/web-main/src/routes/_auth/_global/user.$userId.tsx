import { UserAssignmentOutputDTO, UserOutputWithRolesDTO } from '@takaro/apiclient';
import { Button, Divider, Dropdown, IconButton, Skeleton, Table, useTableActions } from '@takaro/lib-components';
import { useUserRemoveRole, userMeQueryOptions, userQueryOptions } from 'queries/user';
import { createColumnHelper } from '@tanstack/react-table';
import { FC } from 'react';
import { Outlet, redirect, useNavigate, createFileRoute, Link } from '@tanstack/react-router';
import { DateTime } from 'luxon';
import { AiOutlineDelete as DeleteIcon, AiOutlineRight as ActionIcon, AiOutlineEye as ViewIcon } from 'react-icons/ai';
import { hasPermission } from 'hooks/useHasPermission';
import { useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/_auth/_global/user/$userId')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['READ_USERS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: ({ params, context }) => context.queryClient.ensureQueryData(userQueryOptions(params.userId)),
  component: Component,
  pendingComponent: () => <Skeleton variant="rectangular" height="100%" width="100%" />,
});

function Component() {
  const loaderData = Route.useLoaderData();
  const { userId } = Route.useParams();
  const { data: user } = useQuery({
    ...userQueryOptions(userId),
    initialData: loaderData,
  });

  return <UserProfilePage user={user} />;
}

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

interface IUserRolesTableProps {
  roles: UserAssignmentOutputDTO[];
  userId: string;
}

const UserRolesTable: FC<IUserRolesTableProps> = ({ roles, userId }) => {
  const { pagination, columnFilters, sorting, columnSearch } = useTableActions<UserAssignmentOutputDTO>();
  const { mutate } = useUserRemoveRole({ userId });
  const navigate = useNavigate();

  const columnHelper = createColumnHelper<UserAssignmentOutputDTO>();

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
      renderToolbar={() => (
        <Button onClick={() => navigate({ to: '/user/$userId/role/assign', params: { userId } })} text="Assign role" />
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
  );
};
