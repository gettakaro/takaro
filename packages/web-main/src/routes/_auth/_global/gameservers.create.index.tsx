import { SubmitHandler } from 'react-hook-form';
import { redirect, useNavigate, createFileRoute } from '@tanstack/react-router';
import { useGameServerCreate } from 'queries/gameserver';
import { CreateUpdateForm } from './-gameservers/CreateUpdateForm';
import { IFormInputs } from './-gameservers/validationSchema';
import { GameServerCreateDTOTypeEnum } from '@takaro/apiclient';
import { hasPermission } from 'hooks/useHasPermission';
import { userMeQueryOptions } from 'queries/user';

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
  const { mutate, isPending, error: gameServerCreateError, isSuccess } = useGameServerCreate();

  const onSubmit: SubmitHandler<IFormInputs> = ({ type, connectionInfo, name }) => {
    mutate({
      type: type as GameServerCreateDTOTypeEnum,
      name,
      connectionInfo: JSON.stringify(connectionInfo),
    });
  };

  if (isSuccess) {
    navigate({ to: '/gameservers' });
  }

  return <CreateUpdateForm onSubmit={onSubmit} isLoading={isPending} error={gameServerCreateError} />;
}
