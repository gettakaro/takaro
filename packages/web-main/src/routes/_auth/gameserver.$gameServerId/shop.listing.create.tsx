import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';
import { ShopListingCreateUpdateForm } from './-components/-ShopListingCreateUpdateForm';
import { gameServerSettingQueryOptions } from 'queries/setting';
import { useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/shop/listing/create')({
  beforeLoad: ({ context }) => {
    if (!hasPermission(context.auth.session, ['READ_SETTINGS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData(gameServerSettingQueryOptions('currencyName', params.gameServerId));
  },
  component: Component,
});

function Component() {
  const { gameServerId } = Route.useParams();
  const loaderCurrencyName = Route.useLoaderData();
  const navigate = Route.useNavigate();

  const { data: currencyName } = useQuery({
    ...gameServerSettingQueryOptions('currencyName', gameServerId),
    initialData: loaderCurrencyName,
  });

  const onSubmit = () => {
    navigate({ to: '/gameserver/$gameServerId/shop', params: { gameServerId } });
  };

  return (
    <ShopListingCreateUpdateForm
      onSubmit={onSubmit}
      isLoading={false}
      error={null}
      gameServerId={gameServerId}
      currencyName={currencyName.value}
    />
  );
}
