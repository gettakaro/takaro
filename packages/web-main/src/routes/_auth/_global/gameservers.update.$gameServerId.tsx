import { SubmitHandler } from 'react-hook-form';
import { DrawerSkeleton } from '@takaro/lib-components';
import { redirect, useNavigate, createFileRoute } from '@tanstack/react-router';
import {
  gameServerQueryOptions,
  useGameServerReachabilityByConfig,
  useGameServerUpdate,
} from '../../../queries/gameserver';
import { CreateUpdateForm } from './-gameservers/CreateUpdateForm';
import { IFormInputs } from './-gameservers/validationSchema';
import { hasPermission } from '../../../hooks/useHasPermission';
import { userMeQueryOptions } from '../../../queries/user';
import { GameServerTestReachabilityInputDTOTypeEnum } from '@takaro/apiclient';
import { useState } from 'react';

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

  const [notReachableReason, setNotReachableReason] = useState<string>();

  const {
    mutateAsync: testReachability,
    isPending: testReachabilityIsPending,
    error: testReachabilityError,
  } = useGameServerReachabilityByConfig();
  const {
    mutate: updateGameServer,
    isPending: updateGameServerIsPending,
    error: gameServerUpdateError,
    isSuccess: updateGameServerIsSuccess,
  } = useGameServerUpdate();

  const onSubmit: SubmitHandler<IFormInputs> = async ({ name, connectionInfo, enabled, type }) => {
    try {
      setNotReachableReason(undefined);

      if (enabled) {
        const response = await testReachability({
          type: type as GameServerTestReachabilityInputDTOTypeEnum,
          connectionInfo: JSON.stringify(connectionInfo),
        });

        if (response.connectable === false) {
          setNotReachableReason(response.reason);
          return;
        }
      }

      updateGameServer({
        gameServerId,
        gameServerDetails: {
          name,
          enabled,
          type: gameServer.type,
          connectionInfo: JSON.stringify(connectionInfo),
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (updateGameServerIsSuccess) {
    navigate({ to: '/gameservers' });
  }

  return (
    <CreateUpdateForm
      onSubmit={onSubmit}
      initialData={gameServer}
      isLoading={testReachabilityIsPending || updateGameServerIsPending}
      error={notReachableReason || testReachabilityError || gameServerUpdateError}
    />
  );
}
