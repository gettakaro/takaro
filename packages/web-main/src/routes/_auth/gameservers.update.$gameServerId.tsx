import { SubmitHandler } from 'react-hook-form';
import { DrawerSkeleton } from '@takaro/lib-components';
import { useNavigate } from '@tanstack/react-router';
import { gameServerOptions } from 'queries/gameservers';
import { useGameServerUpdate } from 'queries/gameservers/queries';
import { createFileRoute } from '@tanstack/react-router';
import { CreateUpdateForm } from './-gameservers/CreateUpdateForm';
import { IFormInputs } from './-gameservers/validationSchema';

export const Route = createFileRoute('/_auth/gameservers/update/$gameServerId')({
  loader: ({ params, context }) => context.queryClient.ensureQueryData(gameServerOptions(params.gameServerId)),
  component: Component,
  pendingComponent: DrawerSkeleton,
});

function Component() {
  const { gameServerId } = Route.useParams();
  const gameServer = Route.useLoaderData();
  const navigate = useNavigate({ from: Route.fullPath });
  const { mutate, isPending, error: gameServerUpdateError } = useGameServerUpdate();

  const onSubmit: SubmitHandler<IFormInputs> = ({ name, connectionInfo }) => {
    mutate({
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
