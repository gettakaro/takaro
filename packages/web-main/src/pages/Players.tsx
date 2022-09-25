import {  FC, Fragment } from "react";
import { Helmet } from "react-helmet";
import { styled, Table, Loading, Button } from "@takaro/lib-components";
import { useApiClient } from "hooks/useApiClient";
import { useQuery } from "react-query";
import { PlayerOutputArrayDTOAPI } from "@takaro/apiclient";

const TableContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
`;

const Players: FC = () => {
  const client = useApiClient();

  const { data, isLoading, refetch } = useQuery<PlayerOutputArrayDTOAPI>(
    'players',
    async () => (await client.player.playerControllerSearch()).data,
  );

  const columDefs = [
    {field: 'updatedAt', headerName: 'Updated'},
    {field: 'name', headerName: 'Name', filter: 'agTextColumnFilter'},
    {field: 'steamId', headerName: 'Steam ID', filter: 'agTextColumnFilter'},
    {field: 'epicOnlineServicesId', headerName: 'EOS ID', filter: 'agTextColumnFilter'},
    {field: 'xboxLiveId', headerName: 'Xbox ID', filter: 'agTextColumnFilter'},
  ]

  if (isLoading || data === undefined) {
    return <Loading/>
  }

  return (
    <Fragment>
      <Helmet>
        <title>Players - Takaro</title>
      </Helmet>

      <TableContainer>
        <Table columnDefs={columDefs} rowData={data.data} width={'100%'} height={'80vh'} />
      </TableContainer>
    </Fragment>
  );
}

export default Players;