import { FC, useEffect, useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  Table,
  useTableActions,
  IconButton,
  Dropdown,
  Dialog,
  Button,
  TextField,
  FormError,
  DateFormatter,
  CopyId,
  useTheme,
} from '@takaro/lib-components';

import { Player } from 'components/Player';
import { useUserRemove, useInviteUser, usersQueryOptions, userMeQueryOptions } from 'queries/user';
import { UserOutputWithRolesDTO, UserSearchInputDTOSortDirectionEnum, PERMISSIONS } from '@takaro/apiclient';
import { createColumnHelper } from '@tanstack/react-table';
import {
  AiOutlinePlus as PlusIcon,
  AiOutlineDelete as DeleteIcon,
  AiOutlineUser as ProfileIcon,
  AiOutlineEdit as EditIcon,
  AiOutlineRight as ActionIcon,
} from 'react-icons/ai';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { hasPermission, useHasPermission } from 'hooks/useHasPermission';
import { createFileRoute, useNavigate, Link, redirect } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/_auth/_global/users')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['READ_USERS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
});

function Component() {
  useDocumentTitle('Users');
  const { pagination, columnFilters, sorting, columnSearch } = useTableActions<UserOutputWithRolesDTO>();

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
        name: columnSearch.columnSearchState.find((search) => search.id === 'name')?.value,
        discordId: columnSearch.columnSearchState.find((search) => search.id === 'discordId')?.value,
        playerId: columnSearch.columnSearchState.find((search) => search.id === 'playerId')?.value,
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
          <Link to="/user/$userId" params={{ userId: user.id }}>
            {info.getValue()}
          </Link>
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
      renderToolbar={() => <InviteUser />}
      pagination={p}
      columnFiltering={columnFilters}
      columnSearch={columnSearch}
      sorting={sorting}
    />
  );
}

interface IFormInputs {
  userEmail: string;
}

const InviteUser: FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const hasManageUsersPermission = useHasPermission([PERMISSIONS.ManageUsers]);

  const validationSchema = useMemo(
    () =>
      z.object({
        userEmail: z.string().email('Email is not valid.').min(1),
      }),
    [],
  );

  const { control, handleSubmit } = useForm<IFormInputs>({
    resolver: zodResolver(validationSchema),
    mode: 'onSubmit',
  });
  const { mutate, isPending, isError, isSuccess, error } = useInviteUser();

  const onSubmit: SubmitHandler<IFormInputs> = (data) => {
    mutate({ email: data.userEmail });
  };

  useEffect(() => {
    if (isSuccess) {
      setOpen(false);
    }
  }, [isSuccess]);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        text="Invite user"
        icon={<PlusIcon />}
        disabled={!hasManageUsersPermission}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content>
          <Dialog.Heading />
          <Dialog.Body>
            <h2>Invite user</h2>
            <p>
              Inviting users allows them to login to the Takaro dashboard. The user wil receive an email with a link to
              set their password.
            </p>
            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                label="User email"
                name="userEmail"
                placeholder="example@example.com"
                control={control}
                required
              />
              {isError && <FormError error={error} />}
              <Button isLoading={isPending} text="Send invitation" type="submit" fullWidth />
            </form>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </>
  );
};

const UserMenu: FC<{ user: UserOutputWithRolesDTO }> = ({ user }) => {
  const [openDeleteUserDialog, setOpenDeleteUserDialog] = useState<boolean>(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const hasReadUsersPermission = useHasPermission([PERMISSIONS.ReadUsers]);
  const hasManageRolesPermission = useHasPermission([PERMISSIONS.ManageRoles]);

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
            label="Delete user"
            icon={<DeleteIcon fill={theme.colors.error} />}
            onClick={() => setOpenDeleteUserDialog(true)}
            disabled={!hasManageRolesPermission}
          />
        </Dropdown.Menu>
      </Dropdown>
      <UserDeleteDialog openDialog={openDeleteUserDialog} setOpenDialog={setOpenDeleteUserDialog} user={user} />
    </>
  );
};

interface VariableDeleteProps {
  user: UserOutputWithRolesDTO;
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
}

export const UserDeleteDialog: FC<VariableDeleteProps> = ({ user, openDialog, setOpenDialog }) => {
  const { mutateAsync, isPending: isDeleting, error } = useUserRemove();

  const handleOnDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    await mutateAsync({ userId: user.id });
    setOpenDialog(false);
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <Dialog.Content>
        <Dialog.Heading>
          <span>Delete: user</span>
        </Dialog.Heading>
        <Dialog.Body>
          <p>
            Are you sure you want to delete <strong>{user.name}</strong>? This action cannot be undone!
            <br />
          </p>
          {error && <FormError error={error} />}
          <Button
            isLoading={isDeleting}
            onClick={(e) => handleOnDelete(e)}
            fullWidth
            text={'Delete user'}
            color="error"
          />
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
