import { FC, Fragment } from 'react';
import { Button, Empty, EmptyPage, Skeleton, styled } from '@takaro/lib-components';
import { EmptyGameServerCard, GameServerCard } from '../components/GameServerCard';
import { PATHS } from 'paths';
import { useNavigate, Outlet } from 'react-router-dom';
import { useGameServers } from 'queries/gameservers';
import { useDocumentTitle } from 'hooks/useDocumentTitle';

const List = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  grid-auto-rows: 160px;
  gap: ${({ theme }) => theme.spacing['1_5']};
`;

const GameServers: FC = () => {
  useDocumentTitle('Game Servers');
  const navigate = useNavigate();

  // refetch every minute
  const {
    data: gameServers,
    isLoading,
    isError,
    InfiniteScroll,
  } = useGameServers(undefined, { refetchInterval: 60000 });

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

  if (!gameServers || gameServers.pages.length === 0) {
    return (
      <EmptyPage>
        <Empty
          header="Bro, what are you waiting on?"
          description="Create a game server to really get started with Takaro."
          actions={[<Button text="Create a game server" onClick={() => navigate(PATHS.gameServers.create())} />]}
        />
        <Outlet />
      </EmptyPage>
    );
  }

  return (
    <Fragment>
      <List>
        {gameServers.pages
          .flatMap((page) => page.data)
          .map((gameServer) => (
            <GameServerCard key={gameServer.id} {...gameServer} />
          ))}
        <EmptyGameServerCard onClick={() => navigate(PATHS.gameServers.create())} />
      </List>
      {InfiniteScroll}
      {/* show editGameServer and newGameServer drawers above this listView*/}
      <Outlet />
    </Fragment>
  );
};

export default GameServers;
