import { SubmitHandler } from 'react-hook-form';
import { redirect, useNavigate } from '@tanstack/react-router';
import { useGameServerCreate } from 'queries/gameservers';
import { createFileRoute } from '@tanstack/react-router';
import { CreateUpdateForm } from './-gameservers/CreateUpdateForm';
import { IFormInputs } from './-gameservers/validationSchema';
import { GameServerCreateDTOTypeEnum } from '@takaro/apiclient';
import { hasPermission } from 'hooks/useHasPermission';

export const Route = createFileRoute('/_auth/_global/gameservers/create/')({
  beforeLoad: ({ context }) => {
    if (!hasPermission(context.auth.session, ['MANAGE_GAMESERVERS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
});

function Component() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { mutate, isPending, error: gameServerCreateError } = useGameServerCreate();

  const onSubmit: SubmitHandler<IFormInputs> = async ({ type, connectionInfo, name }) => {
    mutate({
      type: type as GameServerCreateDTOTypeEnum,
      name,
      connectionInfo: JSON.stringify(connectionInfo),
    });
    navigate({ to: '/gameservers' });
  };

  return <CreateUpdateForm onSubmit={onSubmit} isLoading={isPending} error={gameServerCreateError} />;
}
