import { FC, Fragment, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { SubmitHandler, useForm } from 'react-hook-form';
import { AiOutlinePlus as PlusIcon } from 'react-icons/ai';
import {
  styled,
  Table,
  Loading,
  useTableActions,
  IconButton,
  Dropdown,
  Dialog,
  Button,
  TextField,
  FormError,
} from '@takaro/lib-components';
import { UserOutputDTO, UserSearchInputDTOSortDirectionEnum } from '@takaro/apiclient';
import { createColumnHelper } from '@tanstack/react-table';
import { useUsers } from 'queries/users';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import { AiOutlineUser as ProfileIcon, AiOutlineEdit as EditIcon, AiOutlineRight as ActionIcon } from 'react-icons/ai';
import { useInviteUser } from 'queries/users/queries';

const TableContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
`;

const Users: FC = () => {
  const { pagination, columnFilters, sorting, columnSearch } = useTableActions<UserOutputDTO>();
  const navigate = useNavigate();

  const { data, isLoading } = useUsers({
    page: pagination.paginationState.pageIndex,
    limit: pagination.paginationState.pageSize,
    sortBy: sorting.sortingState[0]?.id,
    sortDirection: sorting.sortingState[0]?.desc
      ? UserSearchInputDTOSortDirectionEnum.Desc
      : UserSearchInputDTOSortDirectionEnum.Asc,
    filters: {
      name: columnFilters.columnFiltersState.find((filter) => filter.id === 'name')?.value as string,
      discordId: columnFilters.columnFiltersState.find((filter) => filter.id === 'discordId')?.value as string,
    },
    search: {
      name: columnSearch.columnSearchState.find((search) => search.id === 'name')?.value as string,
      discordId: columnSearch.columnSearchState.find((search) => search.id === 'discordId')?.value as string,
    },
  });

  const columnHelper = createColumnHelper<UserOutputDTO>();
  const columnDefs = [
    columnHelper.accessor('name', {
      header: 'Name',
      id: 'name',
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      id: 'email',
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('discordId', {
      header: 'Discord ID',
      id: 'discordId',
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created at',
      id: 'createdAt',
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('updatedAt', {
      header: 'Updated at',
      id: 'updatedAt',
      cell: (info) => info.getValue(),
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
            <IconButton icon={<ActionIcon />} ariaLabel="user-actions" />
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Menu.Group divider>
              <Dropdown.Menu.Item
                label="Go to user profile"
                icon={<ProfileIcon />}
                onClick={() => navigate(`${PATHS.users()}/${info.row.original.id}`)}
              />
            </Dropdown.Menu.Group>
            <Dropdown.Menu.Item label="Edit roles" icon={<EditIcon />} onClick={() => navigate('')} />
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
      <Helmet>
        <title>Users - Takaro</title>
      </Helmet>
      <InviteUser />
      <TableContainer>
        <Table
          columns={columnDefs}
          defaultDensity="relaxed"
          data={data.pages[pagination.paginationState.pageIndex].data}
          pagination={{
            ...pagination,
            pageCount: data.pages[pagination.paginationState.pageIndex].meta.page!,
            total: data.pages[pagination.paginationState.pageIndex].meta.total!,
          }}
          columnFiltering={columnFilters}
          columnSearch={columnSearch}
          sorting={sorting}
        />
      </TableContainer>
    </Fragment>
  );
};

interface IFormInputs {
  userEmail: string;
}

const InviteUser: FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const { control, handleSubmit } = useForm<IFormInputs>();
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
      <Button onClick={() => setOpen(true)} text="Invite user" icon={<PlusIcon />} />
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
              <TextField label="User email" name="userEmail" placeholder="example@example.com" control={control} />
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
