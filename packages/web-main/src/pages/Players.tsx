import { FC, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { styled, Table, Loading, useTableActions } from '@takaro/lib-components';
import { PlayerOutputDTO, PlayerSearchInputDTOSortDirectionEnum } from '@takaro/apiclient';
import { createColumnHelper } from '@tanstack/react-table';
import { usePlayers } from 'queries/players';

const TableContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
`;

const Players: FC = () => {
  const { pagination, columnFilters, sorting } = useTableActions<PlayerOutputDTO>();

  const { data, isLoading } = usePlayers({
    page: pagination.paginationState.pageIndex,
    limit: pagination.paginationState.pageSize,
    sortBy: sorting.sortingState[0]?.id,
    sortDirection: sorting.sortingState[0]?.desc
      ? PlayerSearchInputDTOSortDirectionEnum.Desc
      : PlayerSearchInputDTOSortDirectionEnum.Asc,
    filters: {
      name: columnFilters.columnFiltersState.find((filter) => filter.id === 'name')?.value as string,
      steamId: columnFilters.columnFiltersState.find((filter) => filter.id === 'steamId')?.value as string,
      epicOnlineServicesId: columnFilters.columnFiltersState.find((filter) => filter.id === 'epicOnlineServicesId')
        ?.value as string,
      xboxLiveId: columnFilters.columnFiltersState.find((filter) => filter.id === 'xboxLiveId')?.value as string,
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
    }),
    columnHelper.accessor('xboxLiveId', {
      header: 'Xbox ID',
      id: 'xboxLiveId',
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
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
  ];

  if (isLoading || data === undefined) {
    return <Loading />;
  }

  return (
    <Fragment>
      <Helmet>
        <title>Players - Takaro</title>
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
          sorting={sorting}
        />
      </TableContainer>
    </Fragment>
  );
};

export default Players;
