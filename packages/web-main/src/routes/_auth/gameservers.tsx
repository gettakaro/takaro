import { Fragment } from 'react';
import { Button, Empty, EmptyPage, Skeleton } from '@takaro/lib-components';
import { PERMISSIONS } from '@takaro/apiclient';
import { createFileRoute, useNavigate, Outlet, redirect } from '@tanstack/react-router';
import { gameServersOptions } from 'queries/gameservers';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { PermissionsGuard } from 'components/PermissionsGuard';
import { AddCard, CardList, GameServerCard } from 'components/cards';
import { hasPermission } from 'hooks/useHasPermission';

export const Route = createFileRoute('/_auth/gameservers')({
  beforeLoad: ({ context }) => {
    if (!hasPermission(context.auth.session, ['READ_GAMESERVERS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(gameServersOptions({})),
  component: Component,
  pendingComponent: () => {
    return (
      <CardList>
        <Skeleton variant="rectangular" height="100%" width="100%" />
        <Skeleton variant="rectangular" height="100%" width="100%" />
        <Skeleton variant="rectangular" height="100%" width="100%" />
        <Skeleton variant="rectangular" height="100%" width="100%" />
      </CardList>
    );
  },
});

function Component() {
  useDocumentTitle('Game Servers');
  const gameServers = Route.useLoaderData();
  const navigate = useNavigate();

  if (!gameServers || gameServers.data.length === 0) {
    return (
      <EmptyPage>
        <Empty
          header="Bro, what are you waiting on?"
          description="Create a game server to really get started with Takaro."
          actions={[<Button text="Create a game server" onClick={() => navigate({ to: '/gameservers/create' })} />]}
        />
        <Outlet />
      </EmptyPage>
    );
  }

  return (
    <Fragment>
      <CardList>
        {gameServers.data.map((gameServer) => (
          <GameServerCard key={gameServer.id} {...gameServer} />
        ))}
        <PermissionsGuard requiredPermissions={[PERMISSIONS.ManageGameservers]}>
          <AddCard title="Gameserver" onClick={() => navigate({ to: '/gameservers/create' })} />
        </PermissionsGuard>
        <PermissionsGuard requiredPermissions={[PERMISSIONS.ManageGameservers]}>
          <AddCard title="Import from CSMM" onClick={() => navigate({ to: '/gameservers/create/import' })} />
        </PermissionsGuard>
      </CardList>
      {/* TODO: add back infinite scrol*/}
      {/*InfiniteScroll*/}
      {/* show editGameServer and newGameServer drawers above this listView*/}
      <Outlet />
    </Fragment>
  );
}
