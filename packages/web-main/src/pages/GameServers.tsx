import { FC, Fragment } from "react";
import { Helmet } from "react-helmet";
import { styled, Table, Loading } from "@takaro/lib-components";
import { useApiClient } from "hooks/useApiClient";
import { useQuery } from "react-query";
import { GameServerOutputArrayDTOAPI } from "@takaro/apiclient";

const GridContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
`;


const GameServers: FC = () => {
  const client = useApiClient();

  const { data, isLoading } = useQuery<GameServerOutputArrayDTOAPI>(
    'gameServers',
    async () => (await client.gameserver.gameServerControllerSearch()).data,
  );

  const columDefs = [
    {field: 'createdAt', headerName: 'Created'},
    {field: 'updatedAt', headerName: 'Updated'},
    {field: 'name', headerName: 'Name'},
    {field: 'type', headerName: 'Type'},
  ]

  if (isLoading || data === undefined) {
    return <Loading/>
  }

  return (
    <Fragment>
      <Helmet>
        <title>Gameservers - Takaro</title>
      </Helmet>
      <GridContainer>
        <Table columnDefs={columDefs} rowData={data.data} width={'100%'} height={'400px'} />
      </GridContainer>
    </Fragment>
  );
}

export default GameServers;