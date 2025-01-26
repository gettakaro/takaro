import { createFileRoute } from '@tanstack/react-router';
import { gameServerSettingQueryOptions } from 'queries/setting';
import { gameServerQueryOptions } from 'queries/gameserver';
import { ShopView } from './-components/shop/ShopView';
import { userMeQueryOptions } from 'queries/user';
import { useQueries } from '@tanstack/react-query';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/shop/')({
  loader: async ({ context, params }) => {
    const [currencyName, gameServer, session] = await Promise.all([
      context.queryClient.ensureQueryData(gameServerSettingQueryOptions('currencyName', params.gameServerId)),
      context.queryClient.ensureQueryData(gameServerQueryOptions(params.gameServerId)),
      context.queryClient.ensureQueryData(userMeQueryOptions()),
    ]);

    return {
      currencyName: currencyName,
      gameServer,
      session,
    };
  },
  component: Component,
});

function Component() {
  const loaderData = Route.useLoaderData();
  const { gameServerId } = Route.useParams();

  const [{ data: session }, { data: gameServer }, { data: currencyName }] = useQueries({
    queries: [
      { ...userMeQueryOptions(), initialData: loaderData.session },
      { ...gameServerQueryOptions(gameServerId), initialData: loaderData.gameServer },
      { ...gameServerSettingQueryOptions('currencyName', gameServerId), initialData: loaderData.currencyName },
    ],
  });

  const pog = session.pogs.find((pog) => pog.gameServerId == loaderData.gameServer.id);
  return (
    <ShopView
      gameServerType={gameServer.type}
      gameServerId={gameServerId}
      currencyName={currencyName.value}
      currency={pog?.currency}
    />
  );
}
