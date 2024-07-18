import { ErrorPage } from '@takaro/lib-components';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';
import { gameServerQueryOptions } from 'queries/gameserver';
import { BaseLayout } from 'components/BaseLayout';
import { PERMISSIONS } from '@takaro/apiclient';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId')({
  beforeLoad: async ({ context }) => {
    const session = await context.auth.getSession();
    if (!hasPermission(session, [PERMISSIONS.ManageGameservers])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ params, context }) =>
    await context.queryClient.ensureQueryData(gameServerQueryOptions(params.gameServerId)),
  component: Component,
  errorComponent: ErrorComponent,
});

function Component() {
  return <BaseLayout showGameServerNav />;
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
