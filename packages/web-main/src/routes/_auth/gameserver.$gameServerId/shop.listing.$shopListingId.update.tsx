import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';
import { ShopListingCreateUpdateForm, FormValues } from './-components/-ShopListingCreateUpdateForm';
import { gameServerSettingQueryOptions } from 'queries/setting';
import { shopListingQueryOptions, useShopListingUpdate } from 'queries/shopListing';
import { SubmitHandler } from 'react-hook-form';
import { useDocumentTitle } from 'hooks/useDocumentTitle';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/shop/listing/$shopListingId/update')({
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
  useDocumentTitle('Update Listing');
  const { gameServerId, shopListingId } = Route.useParams();
  const { currencyName, shopListing } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const { mutate, error } = useShopListingUpdate();

  const onSubmit: SubmitHandler<FormValues> = ({ itemId, price, name }) => {
    mutate({
      shopListingId,
      shopListingDetails: {
        itemId,
        price,
        gameServerId,
        name,
      },
    });

    navigate({ to: '/gameserver/$gameServerId/shop', params: { gameServerId } });
  };

  return (
    <ShopListingCreateUpdateForm
      onSubmit={onSubmit}
      isLoading={false}
      error={error}
      initialData={shopListing}
      gameServerId={gameServerId}
      currencyName={currencyName}
    />
  );
}
