import { FC, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { styled, Table, Loading, useTableActions } from '@takaro/lib-components';
import { useApiClient } from 'hooks/useApiClient';
import { useQuery } from '@tanstack/react-query';
import { PlayerOutputDTO, PlayerSearchInputDTOSortDirectionEnum } from '@takaro/apiclient';
import { createColumnHelper } from '@tanstack/react-table';
import { QueryKeys } from 'queryKeys';

const TableContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
`;

const Players: FC = () => {
  const client = useApiClient();
  const { pagination, columnFilters, sorting } = useTableActions<PlayerOutputDTO>();

  const { data, isLoading, refetch } = useQuery(
    [QueryKeys.players.list, pagination.paginationState, sorting.sortingState],
    async () =>
      pagination.paginate(
        await client.player.playerControllerSearch({
          page: pagination.paginationState.pageIndex,
          limit: pagination.paginationState.pageSize,
          sortBy: sorting.sortingState[0]?.id,
          sortDirection: sorting.sortingState[0]?.desc
            ? PlayerSearchInputDTOSortDirectionEnum.Desc
            : PlayerSearchInputDTOSortDirectionEnum.Asc,
        })
      ),
    { keepPreviousData: true }
  );

  const columnHelper = createColumnHelper<PlayerOutputDTO>();
  const columnDefs = [
    columnHelper.accessor('updatedAt', {
      header: 'Updated',
      id: 'updatedAt',
      cell: (info) => info.getValue(),
      enableColumnFilter: false,
      enableSorting: true,
    }),
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
          refetch={refetch}
          columns={columnDefs}
          data={data.rows}
          pagination={{
            ...pagination,
            pageCount: data.pageCount,
            total: data.total,
          }}
          columnFiltering={{ ...columnFilters }}
          sorting={{ ...sorting }}
          refetching={isLoading}
        />
      </TableContainer>
    </Fragment>
  );
};

export default Players;
