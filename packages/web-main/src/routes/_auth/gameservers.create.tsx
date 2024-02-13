import { useEffect } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { redirect, useNavigate } from '@tanstack/react-router';
import { useGameServerCreate } from 'queries/gameservers';
import { createFileRoute } from '@tanstack/react-router';
import { CreateUpdateForm } from './-gameservers/CreateUpdateForm';
import { IFormInputs } from './-gameservers/validationSchema';
import { GameServerCreateDTOTypeEnum } from '@takaro/apiclient';
import { RouterContext } from '../../router';
import { hasPermission } from 'hooks/useHasPermission';

export const Route = createFileRoute('/_auth/gameservers/create')({
  beforeLoad: ({ context }) => {
    if (!hasPermission(context.auth.session, ['MANAGE_GAMESERVERS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
});

function Component() {
  const navigate = useNavigate({ from: Route.fullPath });

  const { setGameserverId } = Route.useRouteContext() as RouterContext;
  const { mutateAsync, isPending, error: gameServerCreateError } = useGameServerCreate();

  useEffect(() => {
    if (!open) {
      navigate({ to: '/gameservers' });
    }
  }, [open, navigate]);

  const onSubmit: SubmitHandler<IFormInputs> = async ({ type, connectionInfo, name }) => {
    try {
      const newGameServer = await mutateAsync({
        type: type as GameServerCreateDTOTypeEnum,
        name,
        connectionInfo: JSON.stringify(connectionInfo),
      });

      // set the new gameserver as selected.
      setGameserverId(newGameServer.id);
      navigate({ to: '/gameservers' });
    } catch {}
  };

  return <CreateUpdateForm onSubmit={onSubmit} isLoading={isPending} error={gameServerCreateError} />;
}
