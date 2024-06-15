import { Button } from '@takaro/lib-components';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { CardList } from 'components/cards';
import { ShopItemCard } from 'components/cards/ShopItemCard';
import { hasPermission } from 'hooks/useHasPermission';
import { gameServerSettingQueryOptions } from 'queries/setting';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/shop/')({
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
  const currencyNameLoader = Route.useLoaderData();
  const navigate = Route.useNavigate();

  const onCreateItemClicked = () => {
    navigate({ to: '/gameserver/$gameServerId/shop/item/create', params: { gameServerId } });
  };

  return (
    <div>
      <Button onClick={onCreateItemClicked}>Create shop listing</Button>
      <CardList>
        <ShopItemCard name="Test Item" price={100} currencyName={currencyNameLoader.value} />
      </CardList>
    </div>
  );
}
