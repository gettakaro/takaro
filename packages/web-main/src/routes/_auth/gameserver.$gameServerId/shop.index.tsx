import { createFileRoute } from '@tanstack/react-router';
import { gameServerSettingQueryOptions } from 'queries/setting';
import { gameServerQueryOptions } from 'queries/gameserver';
import { ShopView } from './-components/shop/ShopView';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/shop/')({
  loader: async ({ context, params }) => {
    const session = await context.auth.getSession();

    const [currencyName, gameServer] = await Promise.all([
      context.queryClient.ensureQueryData(gameServerSettingQueryOptions('currencyName', params.gameServerId)),
      context.queryClient.ensureQueryData(gameServerQueryOptions(params.gameServerId)),
    ]);

    const pog = session.pogs.find((pog) => pog.gameServerId == params.gameServerId);

    return {
      currencyName: currencyName.value,
      gameServer: gameServer,
      currency: pog ? pog.currency : undefined,
    };
  },
  component: Component,
});

function Component() {
  const { currencyName, gameServer, currency } = Route.useLoaderData();
  const { gameServerId } = Route.useParams();

  return (
    <ShopView
      gameServerType={gameServer.type}
      gameServerId={gameServerId}
      currencyName={currencyName}
      currency={currency}
    />
  );
}
