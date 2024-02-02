import { FC, useEffect, useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { AiOutlinePlus as PlusIcon, AiOutlineDelete as DeleteIcon } from 'react-icons/ai';
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
} from '@takaro/lib-components';
import { UserOutputWithRolesDTO, UserSearchInputDTOSortDirectionEnum, PERMISSIONS } from '@takaro/apiclient';
import { createColumnHelper } from '@tanstack/react-table';
import { useUsers } from 'queries/users';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import { AiOutlineUser as ProfileIcon, AiOutlineEdit as EditIcon, AiOutlineRight as ActionIcon } from 'react-icons/ai';
import { useInviteUser } from 'queries/users/queries';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { useHasPermission } from 'components/PermissionsGuard';
import { UserDeleteDialog } from './users/DeleteUserDialog';

const Users: FC = () => {
  useDocumentTitle('Users');
  const { pagination, columnFilters, sorting, columnSearch } = useTableActions<UserOutputWithRolesDTO>();

  const { data, isPending } = useUsers({
    page: pagination.paginationState.pageIndex,
    limit: pagination.paginationState.pageSize,
    sortBy: sorting.sortingState[0]?.id,
    sortDirection: sorting.sortingState[0]?.desc
      ? UserSearchInputDTOSortDirectionEnum.Desc
      : UserSearchInputDTOSortDirectionEnum.Asc,
    filters: {
      name: columnFilters.columnFiltersState.find((filter) => filter.id === 'name')?.value,
      discordId: columnFilters.columnFiltersState.find((filter) => filter.id === 'discordId')?.value,
    },
    search: {
      name: columnSearch.columnSearchState.find((search) => search.id === 'name')?.value,
      discordId: columnSearch.columnSearchState.find((search) => search.id === 'discordId')?.value,
    },
  });

  const columnHelper = createColumnHelper<UserOutputWithRolesDTO>();
  const columnDefs = [
    columnHelper.accessor('name', {
      header: 'Name',
      id: 'name',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      id: 'email',
      enableSorting: true,
    }),
    columnHelper.accessor('discordId', {
      header: 'Discord ID',
      id: 'discordId',
      cell: (info) => <CopyId placeholder="Discord ID" id={info.getValue()} />,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created at',
      id: 'createdAt',
      meta: { dataType: 'datetime', hiddenColumn: true },
      cell: (info) => <DateFormatter ISODate={info.getValue()} />,
      enableSorting: true,
    }),
    columnHelper.accessor('updatedAt', {
      header: 'Updated at',
      id: 'updatedAt',
      meta: { dataType: 'datetime', hiddenColumn: true },
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

  // since pagination depends on data, we need to make sure that data is not undefined
  const p =
    !isPending && data
      ? {
          paginationState: pagination.paginationState,
          setPaginationState: pagination.setPaginationState,
          pageOptions: pagination.getPageOptions(data),
        }
      : undefined;

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
};

interface IFormInputs {
  userEmail: string;
}

const InviteUser: FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const { hasPermission: hasManageUsersPermission, isLoading: isLoadingManageUserPermission } = useHasPermission([
    PERMISSIONS.ManageUsers,
  ]);

  const validationSchema = useMemo(
    () =>
      z.object({
        userEmail: z.string().email('Email is not valid.').nonempty(),
      }),
    []
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
        disabled={!isLoadingManageUserPermission && !hasManageUsersPermission}
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
  const navigate = useNavigate();
  const { hasPermission: hasReadUsersPermission, isLoading: isLoadingReadUserPermission } = useHasPermission([
    PERMISSIONS.ReadUsers,
  ]);
  const { hasPermission: hasManageRolesPermission, isLoading: isLoadingManageRolesPermission } = useHasPermission([
    PERMISSIONS.ManageRoles,
  ]);

  return (
    <>
      <Dropdown placement="left">
        <Dropdown.Trigger asChild>
          <IconButton icon={<ActionIcon />} ariaLabel="user-actions" />
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Menu.Item
            disabled={!isLoadingReadUserPermission && !hasReadUsersPermission}
            label="Go to user profile"
            icon={<ProfileIcon />}
            onClick={() => navigate(`${PATHS.user.profile(user.id)}`)}
          />
          <Dropdown.Menu.Item
            label="Edit roles"
            icon={<EditIcon />}
            onClick={() => navigate(`${PATHS.user.assignRole(user.id)}`)}
            disabled={!isLoadingManageRolesPermission && !hasManageRolesPermission}
          />
          <Dropdown.Menu.Item
            label="Delete user"
            icon={<DeleteIcon />}
            onClick={() => setOpenDeleteUserDialog(true)}
            disabled={!isLoadingManageRolesPermission && !hasManageRolesPermission}
          />
        </Dropdown.Menu>
      </Dropdown>
      <UserDeleteDialog openDialog={openDeleteUserDialog} setOpenDialog={setOpenDeleteUserDialog} user={user} />
    </>
  );
};

export default Users;
