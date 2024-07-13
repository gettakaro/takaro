import { createFileRoute } from '@tanstack/react-router';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { ShopView } from 'routes/_auth/gameserver.$gameServerId/-components/shop/ShopView';
import { gameServerSettingQueryOptions } from 'queries/setting';
import { gameServerQueryOptions } from 'queries/gameserver';
import { playerOnGameServerQueryOptions } from 'queries/pog';

export const Route = createFileRoute('/_auth/_player/shop/$gameServerId/')({
  loader: async ({ context, params }) => {
    const session = await context.auth.getSession();

    const [currencyName, gameServer, pog] = await Promise.all([
      context.queryClient.ensureQueryData(gameServerSettingQueryOptions('currencyName', params.gameServerId)),
      context.queryClient.ensureQueryData(gameServerQueryOptions(params.gameServerId)),
      session.playerId &&
        context.queryClient.ensureQueryData(playerOnGameServerQueryOptions(params.gameServerId, session.playerId)),
    ]);

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
  useDocumentTitle('shop');

  return (
    <ShopView
      gameServerType={gameServer.type}
      currency={currency}
      currencyName={currencyName}
      gameServerId={gameServerId}
    />
  );
}
