import { FC, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import {
  Button,
  Empty,
  EmptyPage,
  Skeleton,
  styled,
} from '@takaro/lib-components';
import {
  EmptyGameServerCard,
  GameServerCard,
} from '../components/GameServerCard';
import { PATHS } from 'paths';
import { useNavigate, Outlet } from 'react-router-dom';
import { useGameServers } from 'queries/gameservers';

const List = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  grid-auto-rows: 160px;
  gap: ${({ theme }) => theme.spacing['1_5']};
`;

const GameServers: FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGameServers();

  if (isLoading) {
    return (
      <List>
        <Skeleton variant="rectangular" height="100%" width="100%" />
        <Skeleton variant="rectangular" height="100%" width="100%" />
        <Skeleton variant="rectangular" height="100%" width="100%" />
        <Skeleton variant="rectangular" height="100%" width="100%" />
      </List>
    );
  }

  if (isError) {
    throw new Error('Failed while loading the servers');
  }

  if (data === undefined || data.length === 0) {
    return (
      <EmptyPage>
        <Empty
          header="Bro, what are you waiting on?"
          description="Create a game server to really get started with Takaro."
          actions={[
            <Button
              text="Create a game server"
              onClick={() => navigate(PATHS.gameServers.create())}
            />,
          ]}
        />
        <Outlet />
      </EmptyPage>
    );
  }

  return (
    <Fragment>
      <Helmet>
        <title>Gameservers - Takaro</title>
      </Helmet>
      <List>
        {data.map((gameServer) => (
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
