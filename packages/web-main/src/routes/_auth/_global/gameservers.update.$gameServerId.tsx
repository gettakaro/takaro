import { SubmitHandler } from 'react-hook-form';
import { DrawerSkeleton } from '@takaro/lib-components';
import { redirect, useNavigate } from '@tanstack/react-router';
import { gameServerQueryOptions } from 'queries/gameservers';
import { useGameServerUpdate } from 'queries/gameservers/queries';
import { createFileRoute } from '@tanstack/react-router';
import { CreateUpdateForm } from './-gameservers/CreateUpdateForm';
import { IFormInputs } from './-gameservers/validationSchema';
import { hasPermission } from 'hooks/useHasPermission';

export const Route = createFileRoute('/_auth/_global/gameservers/update/$gameServerId')({
  beforeLoad: ({ context }) => {
    if (!hasPermission(context.auth.session, ['MANAGE_GAMESERVERS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: ({ params, context }) => context.queryClient.ensureQueryData(gameServerQueryOptions(params.gameServerId)),
  component: Component,
  pendingComponent: DrawerSkeleton,
});

function Component() {
  const { gameServerId } = Route.useParams();
  const gameServer = Route.useLoaderData();
  const navigate = useNavigate({ from: Route.fullPath });
  const { mutateAsync, isPending, error: gameServerUpdateError } = useGameServerUpdate();

  const onSubmit: SubmitHandler<IFormInputs> = async ({ name, connectionInfo }) => {
    await mutateAsync({
      gameServerId,
      gameServerDetails: {
        name,
        type: gameServer.type,
        connectionInfo: JSON.stringify(connectionInfo),
      },
    });
    navigate({ to: '/gameservers' });
  };

  return (
    <CreateUpdateForm
      onSubmit={onSubmit}
      initialData={gameServer}
      isLoading={isPending}
      error={gameServerUpdateError}
    />
  );
}
