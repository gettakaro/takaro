import { FC, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { AiFillPlusCircle } from 'react-icons/ai';
import { useQuery } from 'react-query';
import { useApiClient } from 'hooks/useApiClient';
import { styled, Button } from '@takaro/lib-components';
import { GameServerOutputArrayDTOAPI } from '@takaro/apiclient';
import {
  EmptyGameServerCard,
  GameServerCard,
} from '../components/GameServerCard';

const List = styled.ul`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing['2']};
`;

const GameServers: FC = () => {
  const client = useApiClient();

  const { data, isLoading } = useQuery<GameServerOutputArrayDTOAPI>(
    'gameSevers',
    async () => (await client.gameserver.gameServerControllerSearch()).data
  );

  if (isLoading) {
    return <Fragment>Loading...</Fragment>;
  }

  if (!data) {
    return <Fragment>Something went wrong</Fragment>;
  }

  return (
    <Fragment>
      <Helmet>
        <title>Gameservers - Takaro</title>
      </Helmet>
      <List>
        {data.data.map((gameServer) => (
          <GameServerCard key={gameServer.id} {...gameServer} />
        ))}
        <EmptyGameServerCard
          onClick={() => {
            /* blocked by <drawer /> */
          }}
        />
      </List>
    </Fragment>
  );
};

export default GameServers;
