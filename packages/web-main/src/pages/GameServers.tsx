import { FC, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from 'react-query';
import { useApiClient } from 'hooks/useApiClient';
import { styled } from '@takaro/lib-components';
import { GameServerOutputArrayDTOAPI } from '@takaro/apiclient';
import {
  EmptyGameServerCard,
  GameServerCard,
} from '../components/GameServerCard';
import { PATHS } from 'paths';
import { useNavigate, Outlet } from 'react-router-dom';

const List = styled.ul`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing['2']};
`;

const GameServers: FC = () => {
  const client = useApiClient();
  const navigate = useNavigate();

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
          onClick={() => navigate(PATHS.gameServers.create())}
        />
      </List>
      <Outlet />
    </Fragment>
  );
};

export default GameServers;
