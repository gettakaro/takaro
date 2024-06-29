import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';
import { itemQueryOptions, useItemUpdate } from 'queries/item';
import { FormInputs, ItemCreateUpdateForm } from './-components/ItemCreateUpdateForm';
import { SubmitHandler } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/item/$itemId/update')({
  beforeLoad: async ({ context }) => {
    if (!hasPermission(await context.auth.getSession(), ['READ_ITEMS', 'MANAGE_ITEMS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData(itemQueryOptions(params.itemId));
  },
  component: Component,
});

function Component() {
  const { mutate, isPending } = useItemUpdate();
  const loadedItem = Route.useLoaderData();
  const { gameServerId, itemId } = Route.useParams();
  const { data } = useQuery({ ...itemQueryOptions(itemId), initialData: loadedItem });

  const onSubmit: SubmitHandler<FormInputs> = async ({ icon, name, code, description }) => {
    const i = await icon[0].text();

    mutate({
      itemId,
      itemDetails: {
        icon: i,
        description,
        name,
        code,
      },
    });
  };

  return (
    <ItemCreateUpdateForm isLoading={isPending} gameServerId={gameServerId} onSubmit={onSubmit} initialData={data} />
  );
}
