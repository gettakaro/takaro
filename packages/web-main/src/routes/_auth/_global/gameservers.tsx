import { createFileRoute, useNavigate, Outlet, redirect } from '@tanstack/react-router';
import { gameServersInfiniteQueryOptions } from 'queries/gameserver';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { hasPermission } from 'hooks/useHasPermission';
import { PermissionsGuard } from 'components/PermissionsGuard';
import { AddCard, CardList, GameServerCard } from 'components/cards';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ErrorBoundary } from '@sentry/react';
import { Button, Empty, EmptyPage, InfiniteScroll, Skeleton } from '@takaro/lib-components';
import { Fragment } from 'react';
import { PERMISSIONS } from '@takaro/apiclient';

export const Route = createFileRoute('/_auth/_global/gameservers')({
  beforeLoad: async ({ context }) => {
    const session = await context.auth.getSession();
    if (!hasPermission(session, [PERMISSIONS.ManageGameservers])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ context }) => {
    const opts = gameServersInfiniteQueryOptions();
    return context.queryClient.getQueryData(opts.queryKey) ?? (await context.queryClient.fetchInfiniteQuery(opts));
  },

  errorComponent: () => <ErrorBoundary />,
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
  const loaderData = Route.useLoaderData();
  const navigate = useNavigate();

  const {
    data: gameServers,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...gameServersInfiniteQueryOptions(),
    initialData: loaderData,
  });

  if (!gameServers || gameServers.pages.length === 0) {
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
        {gameServers.pages
          .flatMap((page) => page.data)
          .map((gameServer) => (
            <GameServerCard key={gameServer.id} {...gameServer} />
          ))}
        <PermissionsGuard requiredPermissions={[PERMISSIONS.ManageGameservers]}>
          <AddCard title="Gameserver" onClick={() => navigate({ to: '/gameservers/create' })} />
        </PermissionsGuard>
        <PermissionsGuard requiredPermissions={[PERMISSIONS.ManageGameservers]}>
          <AddCard title="Import from CSMM" onClick={() => navigate({ to: '/gameservers/create/import' })} />
        </PermissionsGuard>
      </CardList>
      <InfiniteScroll
        isFetching={isFetching}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
      <Outlet />
    </Fragment>
  );
}
