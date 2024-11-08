import { createFileRoute, redirect } from '@tanstack/react-router';
import { BaseLayout } from 'components/BaseLayout';
import { hasPermission } from 'hooks/useHasPermission';
import { gameServersQueryOptions } from 'queries/gameserver';
import { userMeQueryOptions } from 'queries/user';

export const Route = createFileRoute('/_auth/_global')({
  beforeLoad: async ({ context, location }) => {
    // Redirect users to the first available gameservershop if they don't have MANAGE_GAMESERVERS permission.
    // and they logged in to the default '/' path.
    // Later this should be smarter and redirect to specific pages depending on the available permissions.
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    const canManageGameServers = hasPermission(session, ['MANAGE_GAMESERVERS']);
    if (location.pathname == '/' && !canManageGameServers) {
      const gameservers = await context.queryClient.ensureQueryData(gameServersQueryOptions());
      if (gameservers.data.length > 0) {
        throw redirect({ to: '/gameserver/$gameServerId/shop', params: { gameServerId: gameservers.data[0].id } });
      }
    }
  },
  component: Component,
});

function Component() {
  return <BaseLayout showGameServerNav={false} />;
}
