import { FC, Fragment } from 'react';
import { Button, Empty, EmptyPage, Skeleton } from '@takaro/lib-components';
import { PERMISSIONS } from '@takaro/apiclient';
import { PATHS } from 'paths';
import { useNavigate, Outlet } from 'react-router-dom';
import { useGameServers } from 'queries/gameservers';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { PermissionsGuard } from 'components/PermissionsGuard';
import { AddCard, CardList, GameServerCard } from 'components/cards';

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
      <CardList>
        <Skeleton variant="rectangular" height="100%" width="100%" />
        <Skeleton variant="rectangular" height="100%" width="100%" />
        <Skeleton variant="rectangular" height="100%" width="100%" />
        <Skeleton variant="rectangular" height="100%" width="100%" />
      </CardList>
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
      <CardList>
        {gameServers.pages
          .flatMap((page) => page.data)
          .map((gameServer) => (
            <GameServerCard key={gameServer.id} {...gameServer} />
          ))}
        <PermissionsGuard requiredPermissions={[PERMISSIONS.ManageGameservers]}>
          <AddCard title="Gameserver" onClick={() => navigate(PATHS.gameServers.create())} />
        </PermissionsGuard>
        <PermissionsGuard requiredPermissions={[PERMISSIONS.ManageGameservers]}>
          <AddCard title="Import from CSMM" onClick={() => navigate(PATHS.gameServers.import())} />
        </PermissionsGuard>
      </CardList>
      {InfiniteScroll}
      {/* show editGameServer and newGameServer drawers above this listView*/}
      <Outlet />
    </Fragment>
  );
};

export default GameServers;
