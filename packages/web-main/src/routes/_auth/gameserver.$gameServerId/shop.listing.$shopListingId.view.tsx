import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';
import { ShopListingCreateUpdateForm } from './-components/-ShopListingCreateUpdateForm';
import { gameServerSettingQueryOptions } from 'queries/setting';
import { shopListingQueryOptions } from 'queries/shopListing';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/shop/listing/$shopListingId/view')({
  beforeLoad: async ({ context }) => {
    if (!hasPermission(await context.auth.getSession(), ['MANAGE_SHOP_LISTINGS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ context, params }) => {
    const [currencyNameOutput, shopListing] = await Promise.all([
      context.queryClient.ensureQueryData(gameServerSettingQueryOptions('currencyName', params.gameServerId)),
      context.queryClient.ensureQueryData(shopListingQueryOptions(params.shopListingId)),
    ]);

    return {
      currencyName: currencyNameOutput.value,
      shopListing,
    };
  },
  component: Component,
});

function Component() {
  const { gameServerId } = Route.useParams();
  const { currencyName, shopListing } = Route.useLoaderData();

  return (
    <ShopListingCreateUpdateForm
      error={null}
      initialData={shopListing}
      currencyName={currencyName}
      gameServerId={gameServerId}
      onSubmit={() => {}}
    />
  );
}
