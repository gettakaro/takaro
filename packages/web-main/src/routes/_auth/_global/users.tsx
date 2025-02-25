import { FC, useState } from 'react';
import {
  Table,
  useTableActions,
  IconButton,
  Dropdown,
  Button,
  DateFormatter,
  CopyId,
  useTheme,
  Tooltip,
  Chip,
} from '@takaro/lib-components';

import { useSnackbar } from 'notistack';
import { Player } from '../../../components/Player';
import { usersQueryOptions, userMeQueryOptions, userCountQueryOptions, useUserUpdate } from '../../../queries/user';
import { UserOutputWithRolesDTO, UserSearchInputDTOSortDirectionEnum, PERMISSIONS } from '@takaro/apiclient';
import { createColumnHelper } from '@tanstack/react-table';
import {
  AiOutlineSolution as InviteUserIcon,
  AiOutlineDelete as DeleteIcon,
  AiOutlineUser as ProfileIcon,
  AiOutlineEdit as EditIcon,
  AiOutlineRight as ActionIcon,
  AiOutlineUserAdd as DashboardUser,
  AiOutlineUserDelete as RegularUser,
} from 'react-icons/ai';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { hasPermission, useHasPermission } from '../../../hooks/useHasPermission';
import { createFileRoute, useNavigate, Link, redirect } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { UserDeleteDialog } from '../../../components/dialogs/UserDeleteDialog';
import { UserInviteDialog } from '../../../components/dialogs/UserInviteDialog';
import { MaxUsage } from '../../../components/MaxUsage';
import { getCurrentDomain } from '../../../util/getCurrentDomain';

export const Route = createFileRoute('/_auth/_global/users')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['READ_USERS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ context }) => {
    return {
      me: await context.queryClient.ensureQueryData(userMeQueryOptions()),
      users: await context.queryClient.ensureQueryData(userCountQueryOptions()),
    };
  },
  component: Component,
});

function Component() {
  useDocumentTitle('Users');
  const { pagination, columnFilters, sorting, columnSearch } = useTableActions<UserOutputWithRolesDTO>();
  const [quickSearchInput, setQuickSearchInput] = useState<string>('');
  const loaderData = Route.useLoaderData();

  const { data: currentUserCount } = useQuery({ ...userCountQueryOptions(), initialData: loaderData.users });
  const { data: me } = useQuery({ ...userMeQueryOptions(), initialData: loaderData.me });

  const currentDomain = getCurrentDomain(me);
  const maxUserCount = currentDomain.maxUsers;
  const canInviteUser = currentUserCount < maxUserCount;

  const { data, isLoading } = useQuery({
    ...usersQueryOptions({
      page: pagination.paginationState.pageIndex,
      limit: pagination.paginationState.pageSize,
      sortBy: sorting.sortingState[0]?.id,
      sortDirection: sorting.sortingState[0]?.desc
        ? UserSearchInputDTOSortDirectionEnum.Desc
        : UserSearchInputDTOSortDirectionEnum.Asc,
      filters: {
        name: columnFilters.columnFiltersState.find((filter) => filter.id === 'name')?.value,
        discordId: columnFilters.columnFiltersState.find((filter) => filter.id === 'discordId')?.value,
        playerId: columnFilters.columnFiltersState.find((filter) => filter.id === 'playerId')?.value,
      },
      search: {
        name: [
          ...(columnSearch.columnSearchState.find((search) => search.id === 'name')?.value ?? []),
          quickSearchInput,
        ],
        discordId: columnSearch.columnSearchState.find((search) => search.id === 'discordId')?.value,
      },
    }),
  });

  const p =
    !isLoading && data
      ? {
          paginationState: pagination.paginationState,
          setPaginationState: pagination.setPaginationState,
          pageOptions: pagination.getPageOptions(data),
        }
      : undefined;

  const columnHelper = createColumnHelper<UserOutputWithRolesDTO>();
  const columnDefs = [
    columnHelper.accessor('name', {
      header: 'Name',
      id: 'name',
      cell: (info) => {
        const user = info.row.original;
        return (
          <Tooltip placement="right">
            <Tooltip.Trigger asChild>
              <Link className="underline" to="/user/$userId" params={{ userId: user.id }}>
                {info.getValue()}
              </Link>
            </Tooltip.Trigger>
            <Tooltip.Content>Open user profile</Tooltip.Content>
          </Tooltip>
        );
      },
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      id: 'email',
      enableSorting: true,
      meta: {
        hideColumn: true,
      },
    }),
    columnHelper.accessor('discordId', {
      header: 'Discord ID',
      id: 'discordId',
      cell: (info) => <CopyId placeholder="Discord ID" id={info.getValue()} />,
    }),

    columnHelper.accessor('playerId', {
      header: 'Player ID',
      id: 'playerId',
      cell: (info) =>
        info.getValue() ? (
          <Player playerId={info.getValue() as string} name={info.getValue()} showAvatar={false} />
        ) : (
          'no player assigned'
        ),
    }),
    columnHelper.accessor('isDashboardUser', {
      header: () => {
        return (
          <Tooltip>
            <Tooltip.Trigger asChild>
              <span>Team member (Dashboard user)</span>
            </Tooltip.Trigger>
            <Tooltip.Content>User that has access to the dashboard</Tooltip.Content>
          </Tooltip>
        );
      },
      id: 'isDashboardUser',
      cell: (info) => (info.getValue() ? <Chip variant="outline" color="primary" label="Yes" /> : <div>No</div>),
      enableSorting: true,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created at',
      id: 'createdAt',
      meta: { dataType: 'datetime', hideColumn: true },
      cell: (info) => <DateFormatter ISODate={info.getValue()} />,
      enableSorting: true,
    }),
    columnHelper.accessor('updatedAt', {
      header: 'Updated at',
      id: 'updatedAt',
      meta: { dataType: 'datetime', hideColumn: true },
      cell: (info) => <DateFormatter ISODate={info.getValue()} />,
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
      cell: (info) => <UserMenu user={info.row.original} />,
    }),
  ];

  return (
    <Table
      title="List of users"
      id="users"
      columns={columnDefs}
      data={data ? data?.data : []}
      renderToolbar={() => (
        <InviteUser currentUserCount={currentUserCount} maxUserCount={maxUserCount} canInviteUser={canInviteUser} />
      )}
      pagination={p}
      columnFiltering={columnFilters}
      columnSearch={columnSearch}
      sorting={sorting}
      onSearchInputChanged={setQuickSearchInput}
      searchInputPlaceholder="Search by user name..."
    />
  );
}

const InviteUser: FC<{
  currentUserCount: number;
  maxUserCount: number;
  canInviteUser: boolean;
}> = ({ canInviteUser, currentUserCount, maxUserCount }) => {
  const [open, setOpen] = useState<boolean>(false);
  const hasManageUsersPermission = useHasPermission([PERMISSIONS.ManageUsers]);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        text="Invite user"
        icon={<InviteUserIcon />}
        disabled={!hasManageUsersPermission || !canInviteUser}
      />
      <MaxUsage value={currentUserCount} total={maxUserCount} unit="Users" />
      <UserInviteDialog open={open} onOpenChange={setOpen} />
    </>
  );
};

const UserMenu: FC<{ user: UserOutputWithRolesDTO }> = ({ user }) => {
  const [openDeleteUserDialog, setOpenDeleteUserDialog] = useState<boolean>(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const hasReadUsersPermission = useHasPermission([PERMISSIONS.ReadUsers]);
  const hasManageUsersPermission = useHasPermission([PERMISSIONS.ManageUsers]);
  const hasManageRolesPermission = useHasPermission([PERMISSIONS.ManageRoles]);
  const { mutate } = useUserUpdate();
  const { enqueueSnackbar } = useSnackbar();

  const onToggleDashboardUser = () => {
    try {
      mutate({ userId: user.id, isDashboardUser: !user.isDashboardUser });
    } catch {
      if (user.isDashboardUser) {
        enqueueSnackbar('Failed to downgrade user', { variant: 'default', type: 'error' });
      } else {
        enqueueSnackbar('Failed to upgrade user to team member', { variant: 'default', type: 'error' });
      }
    }
  };

  return (
    <>
      <Dropdown placement="left">
        <Dropdown.Trigger asChild>
          <IconButton icon={<ActionIcon />} ariaLabel="user-actions" />
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Menu.Item
            disabled={!hasReadUsersPermission}
            label="Go to user profile"
            icon={<ProfileIcon />}
            onClick={() => navigate({ to: '/user/$userId', params: { userId: user.id } })}
          />
          <Dropdown.Menu.Item
            label="Edit roles"
            icon={<EditIcon />}
            onClick={() => navigate({ to: '/user/$userId/role/assign', params: { userId: user.id } })}
            disabled={!hasManageRolesPermission}
          />
          <Dropdown.Menu.Item
            icon={user.isDashboardUser ? <RegularUser /> : <DashboardUser />}
            label={user.isDashboardUser ? 'Downgrade to regular user' : 'Upgrade to Team member'}
            onClick={onToggleDashboardUser}
            disabled={!hasManageUsersPermission}
          />
          <Dropdown.Menu.Item
            label="Delete user"
            icon={<DeleteIcon fill={theme.colors.error} />}
            onClick={() => setOpenDeleteUserDialog(true)}
            disabled={!hasManageRolesPermission}
          />
        </Dropdown.Menu>
      </Dropdown>
      <UserDeleteDialog
        open={openDeleteUserDialog}
        onOpenChange={setOpenDeleteUserDialog}
        userId={user.id}
        userName={user.name}
      />
    </>
  );
};
