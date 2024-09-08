import { SubmitHandler } from 'react-hook-form';
import { DrawerSkeleton } from '@takaro/lib-components';
import { redirect, useNavigate, createFileRoute } from '@tanstack/react-router';
import { gameServerQueryOptions, useGameServerUpdate } from 'queries/gameserver';
import { CreateUpdateForm } from './-gameservers/CreateUpdateForm';
import { IFormInputs } from './-gameservers/validationSchema';
import { hasPermission } from 'hooks/useHasPermission';
import { useEffect } from 'react';
import { userMeQueryOptions } from 'queries/user';

export const Route = createFileRoute('/_auth/_global/gameservers/update/$gameServerId')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['MANAGE_GAMESERVERS'])) {
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
  const { mutate, isPending, error: gameServerUpdateError, isSuccess } = useGameServerUpdate();

  const onSubmit: SubmitHandler<IFormInputs> = ({ name, connectionInfo, enabled }) => {
    mutate({
      gameServerId,
      gameServerDetails: {
        name,
        enabled,
        type: gameServer.type,
        connectionInfo: JSON.stringify(connectionInfo),
      },
    });
  };

  useEffect(() => {
    if (isSuccess) {
      navigate({ to: '/gameservers' });
    }
  }, [isSuccess]);

  return (
    <CreateUpdateForm
      onSubmit={onSubmit}
      initialData={gameServer}
      isLoading={isPending}
      error={gameServerUpdateError}
    />
  );
}
