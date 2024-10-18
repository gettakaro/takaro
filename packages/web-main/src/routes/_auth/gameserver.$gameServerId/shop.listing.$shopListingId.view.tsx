import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';
import { ShopListingCreateUpdateForm } from './-components/-ShopListingCreateUpdateForm';
import { gameServerSettingQueryOptions } from 'queries/setting';
import { shopListingQueryOptions } from 'queries/shopListing';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { userMeQueryOptions } from 'queries/user';
import { DrawerSkeleton } from '@takaro/lib-components';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/shop/listing/$shopListingId/view')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['MANAGE_SHOP_LISTINGS'])) {
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
  pendingComponent: DrawerSkeleton,
});

function Component() {
  useDocumentTitle('View Listing');
  const { gameServerId } = Route.useParams();
  const { currencyName, shopListing } = Route.useLoaderData();

  return (
    <ShopListingCreateUpdateForm
      error={null}
      initialData={shopListing}
      currencyName={currencyName}
      gameServerId={gameServerId}
    />
  );
}
