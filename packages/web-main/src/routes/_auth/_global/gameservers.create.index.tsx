import { SubmitHandler } from 'react-hook-form';
import { redirect, useNavigate, createFileRoute } from '@tanstack/react-router';
import { useGameServerCreate, useGameServerReachabilityByConfig } from '../../../queries/gameserver';
import { CreateUpdateForm } from './-gameservers/CreateUpdateForm';
import { IFormInputs } from './-gameservers/validationSchema';
import { GameServerCreateDTOTypeEnum, GameServerTestReachabilityInputDTOTypeEnum } from '@takaro/apiclient';
import { hasPermission } from '../../../hooks/useHasPermission';
import { userMeQueryOptions } from '../../../queries/user';
import { useState } from 'react';

export const Route = createFileRoute('/_auth/_global/gameservers/create/')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['MANAGE_GAMESERVERS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
});

function Component() {
  const navigate = useNavigate({ from: Route.fullPath });
  const [notReachableReason, setNotReachableReason] = useState<string>();
  const {
    mutate: createGameServer,
    isPending: createGameServerIsPending,
    error: gameServerCreateError,
    isSuccess: createGameServerIsSuccess,
  } = useGameServerCreate();
  const {
    mutateAsync: testReachability,
    isPending: testReachabilityIsPending,
    error: testReachabilityError,
  } = useGameServerReachabilityByConfig();

  const onSubmit: SubmitHandler<IFormInputs> = async ({ type, connectionInfo, name, enabled }) => {
    try {
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

      createGameServer({
        type: type as GameServerCreateDTOTypeEnum,
        name,
        connectionInfo: JSON.stringify(connectionInfo),
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (createGameServerIsSuccess) {
    navigate({ to: '/gameservers' });
  }

  return (
    <CreateUpdateForm
      onSubmit={onSubmit}
      isLoading={testReachabilityIsPending || createGameServerIsPending}
      error={notReachableReason || testReachabilityError || gameServerCreateError}
    />
  );
}
