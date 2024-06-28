import { SubmitHandler } from 'react-hook-form';
import { redirect, useNavigate } from '@tanstack/react-router';
import { useGameServerCreate } from 'queries/gameserver';
import { createFileRoute } from '@tanstack/react-router';
import { CreateUpdateForm } from './-gameservers/CreateUpdateForm';
import { IFormInputs } from './-gameservers/validationSchema';
import { GameServerCreateDTOTypeEnum } from '@takaro/apiclient';
import { hasPermission } from 'hooks/useHasPermission';

export const Route = createFileRoute('/_auth/_global/gameservers/create/')({
  beforeLoad: async ({ context }) => {
    const session = await context.auth.getSession();
    if (!hasPermission(session, ['MANAGE_GAMESERVERS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
});

function Component() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { mutateAsync, isPending, error: gameServerCreateError } = useGameServerCreate();

  const onSubmit: SubmitHandler<IFormInputs> = async ({ type, connectionInfo, name }) => {
    await mutateAsync({
      type: type as GameServerCreateDTOTypeEnum,
      name,
      connectionInfo: JSON.stringify(connectionInfo),
    });
    navigate({ to: '/gameservers' });
  };

  return <CreateUpdateForm onSubmit={onSubmit} isLoading={isPending} error={gameServerCreateError} />;
}
