import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasPermission } from '../../../hooks/useHasPermission';
import { ShopListingCreateUpdateForm, FormValues } from '../../../components/shop/ShopListingCreateUpdateForm';
import { gameServerSettingQueryOptions } from '../../../queries/setting';
import { useQuery } from '@tanstack/react-query';
import { SubmitHandler } from 'react-hook-form';
import { useShopListingCreate } from '../../../queries/shopListing';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { userMeQueryOptions } from '../../../queries/user';
import { DrawerSkeleton } from '@takaro/lib-components';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/shop/listing/create')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['MANAGE_SHOP_LISTINGS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ context, params }) => {
    return await context.queryClient.ensureQueryData(
      gameServerSettingQueryOptions('currencyName', params.gameServerId),
    );
  },
  component: Component,
  pendingComponent: DrawerSkeleton,
});

function Component() {
  useDocumentTitle('Create Listing');
  const { gameServerId } = Route.useParams();
  const loaderCurrencyName = Route.useLoaderData();
  const navigate = Route.useNavigate();

  const { mutate, error, isPending } = useShopListingCreate();

  const { data: currencyName } = useQuery({
    ...gameServerSettingQueryOptions('currencyName', gameServerId),
    initialData: loaderCurrencyName,
  });

  const onSubmit: SubmitHandler<FormValues> = ({ name, items, price, draft, categoryIds }) => {
    mutate(
      {
        name: name ? name : 'Unnamed',
        price,
        gameServerId,
        items,
        draft,
        categoryIds,
      },
      {
        onSuccess: () => {
          navigate({ to: '/gameserver/$gameServerId/shop', params: { gameServerId } });
        },
      },
    );
  };

  return (
    <ShopListingCreateUpdateForm
      onSubmit={onSubmit}
      isLoading={isPending}
      error={error}
      gameServerId={gameServerId}
      currencyName={currencyName.value}
    />
  );
}
