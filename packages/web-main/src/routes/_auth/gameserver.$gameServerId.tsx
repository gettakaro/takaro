import { ErrorPage } from '@takaro/lib-components';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';
import { gameServerOptions } from 'queries/gameservers';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId')({
  beforeLoad: ({ context, params }) => {
    if (!hasPermission(context.auth.session, ['READ_GAMESERVERS'])) {
      throw redirect({ to: '/forbidden' });
    }

    // update local storage with the current game server id
    if (localStorage.getItem('gameServerId') !== params.gameServerId) {
      localStorage.setItem('gameServerId', params.gameServerId);
    }
  },
  loader: ({ params, context }) => context.queryClient.ensureQueryData(gameServerOptions(params.gameServerId)),
  component: Component,
  errorComponent: ErrorComponent,
});

function Component() {
  return <Outlet />;
}

function ErrorComponent() {
  return (
    <ErrorPage
      errorCode={404}
      title="Game Server not found"
      description="The game server you are looking for does not exist."
      homeRoute={'/dashboard'}
    />
  );
}
