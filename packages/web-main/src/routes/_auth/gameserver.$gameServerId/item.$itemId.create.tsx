import { createFileRoute, redirect } from '@tanstack/react-router';
import { ItemCreateUpdateForm, FormInputs } from './-components/ItemCreateUpdateForm';
import { useItemCreate } from 'queries/item';
import { hasPermission } from 'hooks/useHasPermission';
import { SubmitHandler } from 'react-hook-form';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/item/$itemId/create')({
  beforeLoad: async ({ context }) => {
    if (!hasPermission(await context.auth.getSession(), ['READ_ITEMS', 'MANAGE_ITEMS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },

  component: Component,
});

function Component() {
  const { mutate, isPending } = useItemCreate();
  const { gameServerId } = Route.useParams();

  const onSubmit: SubmitHandler<FormInputs> = async ({ icon, name, code, description }) => {
    const i = await icon[0].text();

    mutate({
      icon: i,
      name,
      code,
      description,
      gameserverId: gameServerId,
    });
  };

  return <ItemCreateUpdateForm isLoading={isPending} gameServerId={gameServerId} onSubmit={onSubmit} />;
}
