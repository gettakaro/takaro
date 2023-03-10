import { FC, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import {
  styled,
  Table,
  Loading,
  Button,
  useTableActions,
} from '@takaro/lib-components';
import { useApiClient } from 'hooks/useApiClient';
import { AiFillPlusCircle } from 'react-icons/ai';
import { useQuery } from 'react-query';
import { GameServerOutputDTO } from '@takaro/apiclient';
import { useNavigate, NavLink } from 'react-router-dom';
import { PATHS } from 'paths';
import { DeleteGameServerButton } from 'components/gameserver/deleteButton';
import { useSnackbar } from 'notistack';
import { createColumnHelper } from '@tanstack/react-table';

const TableContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
`;

const TableLink = styled(NavLink)<{ type: 'normal' | 'danger' }>`
  color: ${({ theme, type }) =>
    type === 'normal' ? theme.colors.primary : theme.colors.error};
`;

const GameServers: FC = () => {
  const client = useApiClient();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { pagination } = useTableActions<GameServerOutputDTO>();

  const { data, isLoading, refetch } = useQuery(
    'gameServers',
    async () =>
      pagination.paginate(
        await client.gameserver.gameServerControllerSearch({
          limit: 10,
          page: 10,
        })
      ),
    { keepPreviousData: true }
  );

  const columnHelper = createColumnHelper<GameServerOutputDTO>();

  const columnDefs = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: ({ row }) => (
        <TableLink
          type="normal"
          to={PATHS.gameServers.dashboard.replace(':serverId', row.id)}
        >
          {row.id}
        </TableLink>
      ),
    }),
    columnHelper.accessor('type', { header: 'Type' }),
    columnHelper.accessor('id', {
      cell: ({ row }) => (
        <TableLink
          type="normal"
          to={PATHS.gameServers.update.replace(':serverId', row.id)}
        >
          edit
        </TableLink>
      ),
    }),
    columnHelper.accessor('id', {
      cell: ({ row }) => (
        <TableLink
          type="normal"
          to={PATHS.settingsGameserver.replace(':serverId', row.id)}
        >
          settings
        </TableLink>
      ),
    }),
    columnHelper.accessor('id', {
      cell: ({ row }) => (
        <DeleteGameServerButton
          action={async () => {
            await client.gameserver.gameServerControllerRemove(row.id);
            refetch();
            enqueueSnackbar('The server was deleted', {
              type: 'success',
            });
          }}
        />
      ),
    }),
  ];

  if (isLoading || data === undefined) {
    return <Loading />;
  }

  return (
    <Fragment>
      <Helmet>
        <title>Gameservers - Takaro</title>
      </Helmet>
      <Button
        icon={<AiFillPlusCircle size={20} />}
        onClick={() => {
          navigate(PATHS.gameServers.create);
        }}
        text="Add gameserver"
      />
      <TableContainer>
        <Table
          columns={columnDefs}
          data={data.rows}
          pagination={{
            pageCount: data.pageCount,
            pageIndex: pagination.paginationState.pageIndex,
            setPagination: pagination.setPaginationState,
          }}
        />
      </TableContainer>
    </Fragment>
  );
};

export default GameServers;
