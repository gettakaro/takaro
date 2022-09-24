import {  FC, Fragment } from "react";
import { Helmet } from "react-helmet";
import { styled, Table, Loading, Button } from "@takaro/lib-components";
import { useApiClient } from "hooks/useApiClient";
import { AiFillPlusCircle } from "react-icons/ai";
import { useQuery } from "react-query";
import { GameServerOutputArrayDTOAPI } from "@takaro/apiclient";
import { useNavigate } from 'react-router-dom';
import { PATHS } from "paths";
import { DeleteGameServerButton } from "components/gameserver/deleteButton";

const GridContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;



const GameServers: FC = () => {
  const client = useApiClient();
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useQuery<GameServerOutputArrayDTOAPI>(
    'gameServers',
    async () => (await client.gameserver.gameServerControllerSearch()).data,
  );

  const columDefs = [
    {field: 'createdAt', headerName: 'Created'},
    {field: 'updatedAt', headerName: 'Updated'},
    {field: 'name', headerName: 'Name'},
    {field: 'type', headerName: 'Type'},
    {field: 'id', headerName: '', cellRenderer: (row) => {
      // TODO: This will display a confirmation message
      // But it's broken :( I think it's because it's being rendered inside the table
      // return <DeleteGameServerButton/>
      return <Button text={'Delete server'} onClick={async (field) => {
        await client.gameserver.gameServerControllerRemove(row.value)
        refetch()
      }} color={'error'}/>
    }},
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
      <Button
      icon={<AiFillPlusCircle size={20} />}
      onClick={() => {
        navigate(PATHS.gameServers.create)
      }}
      text="Add gameserver"
    />
        <Table columnDefs={columDefs} rowData={data.data} width={'100%'} height={'400px'} />
      </GridContainer>
    </Fragment>
  );
}

export default GameServers;