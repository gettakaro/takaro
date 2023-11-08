import { FC, Fragment, useEffect, useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { AiOutlinePlus as PlusIcon } from 'react-icons/ai';
import {
  Table,
  Loading,
  useTableActions,
  IconButton,
  Dropdown,
  Dialog,
  Button,
  TextField,
  FormError,
  PERMISSIONS,
} from '@takaro/lib-components';

import { UserOutputDTO, UserSearchInputDTOSortDirectionEnum } from '@takaro/apiclient';
import { createColumnHelper } from '@tanstack/react-table';
import { useUsers } from 'queries/users';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import { AiOutlineUser as ProfileIcon, AiOutlineEdit as EditIcon, AiOutlineRight as ActionIcon } from 'react-icons/ai';
import { useInviteUser } from 'queries/users/queries';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { PermissionsGuard, useUserHasPermissions } from 'components/PermissionsGuard';

const Users: FC = () => {
  useDocumentTitle('Users');
  const { pagination, columnFilters, sorting, columnSearch } = useTableActions<UserOutputDTO>();
  const navigate = useNavigate();
  const hasPermission = useUserHasPermissions();

  const { data, isLoading } = useUsers({
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

  const columnHelper = createColumnHelper<UserOutputDTO>();
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
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created at',
      id: 'createdAt',
      cell: (info) => info.getValue(),
      enableSorting: true,
    }),
    columnHelper.accessor('updatedAt', {
      header: 'Updated at',
      id: 'updatedAt',
      cell: (info) => info.getValue(),
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
            <IconButton icon={<ActionIcon />} ariaLabel="user-actions" />
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Menu.Group divider>
              <PermissionsGuard requiredPermissions={[[PERMISSIONS.READ_USERS]]}>
                <Dropdown.Menu.Item
                  label="Go to user profile"
                  icon={<ProfileIcon />}
                  onClick={() => navigate(`${PATHS.user.profile(info.row.original.id)}`)}
                />
              </PermissionsGuard>
            </Dropdown.Menu.Group>
            <PermissionsGuard requiredPermissions={[[PERMISSIONS.MANAGE_ROLES]]}>
              <Dropdown.Menu.Item
                label="Edit roles"
                icon={<EditIcon />}
                onClick={() => navigate('')}
                disabled={hasPermission([PERMISSIONS.MANAGE_ROLES])}
              />
            </PermissionsGuard>
          </Dropdown.Menu>
        </Dropdown>
      ),
    }),
  ];

  if (isLoading || data === undefined) {
    return <Loading />;
  }

  return (
    <Fragment>
      <Table
        id="users"
        columns={columnDefs}
        data={data.data}
        renderToolbar={() => <InviteUser />}
        pagination={{
          ...pagination,
          pageOptions: pagination.getPageOptions(data),
        }}
        columnFiltering={columnFilters}
        columnSearch={columnSearch}
        sorting={sorting}
      />
    </Fragment>
  );
};

interface IFormInputs {
  userEmail: string;
}

const InviteUser: FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const hasPermission = useUserHasPermissions();

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
  const { mutate, isLoading, isError, isSuccess, error } = useInviteUser();

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
        disabled={hasPermission([PERMISSIONS.MANAGE_USERS])}
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
              <Button isLoading={isLoading} text="Send Invitation" type="submit" fullWidth />
            </form>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </>
  );
};

export default Users;
