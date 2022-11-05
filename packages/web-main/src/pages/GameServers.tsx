import { FC, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { styled, Table, Loading, Button } from '@takaro/lib-components';
import { useApiClient } from 'hooks/useApiClient';
import { AiFillPlusCircle } from 'react-icons/ai';
import { useQuery } from 'react-query';
import { GameServerOutputArrayDTOAPI } from '@takaro/apiclient';
import { useNavigate, NavLink } from 'react-router-dom';
import { PATHS } from 'paths';
import { DeleteGameServerButton } from 'components/gameserver/deleteButton';
import { useSnackbar } from 'notistack';

const TableContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
`;

const GameServers: FC = () => {
  const client = useApiClient();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { data, isLoading, refetch } = useQuery<GameServerOutputArrayDTOAPI>(
    'gameServers',
    async () => (await client.gameserver.gameServerControllerSearch()).data
  );

  const columDefs = [
    {
      field: 'name',
      headerName: 'Name',
      cellRenderer: (row) => {
        return (
          <NavLink
            to={PATHS.gameServers.dashboard.replace(':serverId', row.data.id)}
          >
            {row.value}
          </NavLink>
        );
      },
    },
    { field: 'type', headerName: 'Type' },
    {
      field: 'id',
      headerName: '',
      cellRenderer: (row) => {
        return (
          <DeleteGameServerButton
            action={async () => {
              await client.gameserver.gameServerControllerRemove(row.value);
              refetch();
              enqueueSnackbar('The server was deleted', {
                variant: 'success',
              });
            }}
          />
        );
      },
    },
    {
      field: 'id',
      headerName: '',
      cellRenderer: (row) => {
        return (
          <Button
            onClick={() =>
              navigate(PATHS.gameServers.update.replace(':serverId', row.value))
            }
            text="Edit"
          />
        );
      },
    },
    {
      field: 'id',
      headerName: '',
      cellRenderer: (row) => {
        return (
          <Button
            onClick={() =>
              navigate(PATHS.settingsGameserver.replace(':serverId', row.value))
            }
            text="Settings"
          />
        );
      },
    },
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
          columnDefs={columDefs}
          rowData={data.data}
          width={'100%'}
          height={'400px'}
        />
      </TableContainer>
    </Fragment>
  );
};

export default GameServers;
