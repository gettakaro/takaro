import { FC, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import {
  styled,
  Table,
  Loading,
  useTableActions,
} from '@takaro/lib-components';
import { useApiClient } from 'hooks/useApiClient';
import { useQuery } from 'react-query';
import { PlayerOutputDTO } from '@takaro/apiclient';
import { createColumnHelper } from '@tanstack/react-table';

const TableContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
`;

const Players: FC = () => {
  const client = useApiClient();
  const { pagination } = useTableActions<PlayerOutputDTO>();

  const { data, isLoading } = useQuery(
    'players',
    async () =>
      pagination.paginate(
        await client.player.playerControllerSearch({
          page: pagination.paginationState.pageIndex,
          limit: pagination.paginationState.pageSize,
        })
      ),
    { keepPreviousData: true }
  );

  const columnHelper = createColumnHelper<PlayerOutputDTO>();
  const columnDefs = [
    columnHelper.accessor('updatedAt', {
      header: 'Updated',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('steamId', {
      header: 'Steam ID',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('epicOnlineServicesId', {
      header: 'EOS ID',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('xboxLiveId', {
      header: 'Xbox ID',
      cell: (info) => info.getValue(),
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
          data={data.rows}
          pagination={{
            setPagination: pagination.setPaginationState,
            pageCount: data.pageCount,
            pageIndex: pagination.paginationState.pageIndex,
          }}
        />
      </TableContainer>
    </Fragment>
  );
};

export default Players;
