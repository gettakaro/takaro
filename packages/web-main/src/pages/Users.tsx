import { FC, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { styled, Table, Loading, useTableActions, IconButton, Dropdown } from '@takaro/lib-components';
import { UserOutputDTO, UserSearchInputDTOSortDirectionEnum } from '@takaro/apiclient';
import { createColumnHelper } from '@tanstack/react-table';
import { useUsers } from 'queries/users';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import { AiOutlineUser as ProfileIcon, AiOutlineEdit as EditIcon, AiOutlineRight as ActionIcon } from 'react-icons/ai';

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
      name: [columnFilters.columnFiltersState.find((filter) => filter.id === 'name')?.value].filter(
        Boolean
      ) as string[],
      discordId: [columnFilters.columnFiltersState.find((filter) => filter.id === 'discordId')?.value].filter(
        Boolean
      ) as string[],
    },
    search: {
      name: [columnSearch.columnSearchState.find((search) => search.id === 'name')?.value].filter(Boolean) as string[],
      discordId: [columnSearch.columnSearchState.find((search) => search.id === 'discordId')?.value].filter(
        Boolean
      ) as string[],
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

export default Users;
