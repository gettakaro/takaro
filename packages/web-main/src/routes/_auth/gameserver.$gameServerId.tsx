import { ErrorPage } from '@takaro/lib-components';
import { createFileRoute } from '@tanstack/react-router';
import { gameServerQueryOptions } from 'queries/gameserver';
import { BaseLayout } from 'components/BaseLayout';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId')({
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
