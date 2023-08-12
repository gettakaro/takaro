import { FC, Fragment } from 'react';
import { styled, Table, Loading, useTableActions, IconButton, Dropdown } from '@takaro/lib-components';
import { PlayerOutputDTO, PlayerSearchInputDTOSortDirectionEnum } from '@takaro/apiclient';
import { createColumnHelper } from '@tanstack/react-table';
import { usePlayers } from 'queries/players';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import { AiOutlineUser as ProfileIcon, AiOutlineEdit as EditIcon, AiOutlineRight as ActionIcon } from 'react-icons/ai';
import { useDocumentTitle } from 'hooks/useDocumentTitle';

const TableContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
`;

const Players: FC = () => {
  useDocumentTitle('Players');
  const { pagination, columnFilters, sorting, columnSearch } = useTableActions<PlayerOutputDTO>();
  const navigate = useNavigate();

  const { data, isLoading } = usePlayers({
    page: pagination.paginationState.pageIndex,
    limit: pagination.paginationState.pageSize,
    sortBy: sorting.sortingState[0]?.id,
    sortDirection: sorting.sortingState[0]?.desc
      ? PlayerSearchInputDTOSortDirectionEnum.Desc
      : PlayerSearchInputDTOSortDirectionEnum.Asc,
    filters: {
      name: columnFilters.columnFiltersState.find((filter) => filter.id === 'name')?.value,
      steamId: columnFilters.columnFiltersState.find((filter) => filter.id === 'steamId')?.value,
      epicOnlineServicesId: columnFilters.columnFiltersState.find((filter) => filter.id === 'epicOnlineServicesId')
        ?.value,
      xboxLiveId: columnFilters.columnFiltersState.find((filter) => filter.id === 'xboxLiveId')?.value,
    },
    search: {
      name: columnSearch.columnSearchState.find((search) => search.id === 'name')?.value,
      steamId: columnSearch.columnSearchState.find((search) => search.id === 'steamId')?.value,
      epicOnlineServicesId: columnSearch.columnSearchState.find((search) => search.id === 'epicOnlineServicesId')
        ?.value,
      xboxLiveId: columnSearch.columnSearchState.find((search) => search.id === 'xboxLiveId')?.value,
    },
  });

  // IMPORTANT: id should be identical to data object key.
  const columnHelper = createColumnHelper<PlayerOutputDTO>();
  const columnDefs = [
    columnHelper.accessor('name', {
      header: 'Name',
      id: 'name',
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('steamId', {
      header: 'Steam ID',
      id: 'steamId',
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
    }),

    columnHelper.accessor('epicOnlineServicesId', {
      header: 'EOS ID',
      id: 'epicOnlineServicesId',
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('xboxLiveId', {
      header: 'Xbox ID',
      id: 'xboxLiveId',
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
            <IconButton icon={<ActionIcon />} ariaLabel="player-actions" />
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Menu.Item
              label="Go to player profile"
              icon={<ProfileIcon />}
              onClick={() => navigate(`${PATHS.player.profile(info.row.original.id)}`)}
            />
            <Dropdown.Menu.Item
              label="Assign role"
              icon={<EditIcon />}
              onClick={() => navigate(PATHS.player.assignRole(info.row.original.id))}
            />
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
      <TableContainer>
        <Table
          id="players"
          columns={columnDefs}
          data={data.data as PlayerOutputDTO[]}
          pagination={{
            paginationState: pagination.paginationState,
            setPaginationState: pagination.setPaginationState,
            pageOptions: pagination.getPageOptions(data),
          }}
          columnFiltering={columnFilters}
          columnSearch={columnSearch}
          sorting={sorting}
        />
      </TableContainer>
    </Fragment>
  );
};

export default Players;
