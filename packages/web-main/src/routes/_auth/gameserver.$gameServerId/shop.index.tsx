import { createFileRoute } from '@tanstack/react-router';
import { gameServerSettingQueryOptions } from 'queries/setting';
import { gameServerQueryOptions } from 'queries/gameserver';
import { ShopView } from './-components/shop/ShopView';
import { userMeQueryOptions } from 'queries/user';
import { useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/shop/')({
  loader: async ({ context, params }) => {
    const [currencyName, gameServer, session] = await Promise.all([
      context.queryClient.ensureQueryData(gameServerSettingQueryOptions('currencyName', params.gameServerId)),
      context.queryClient.ensureQueryData(gameServerQueryOptions(params.gameServerId)),
      context.queryClient.ensureQueryData(userMeQueryOptions()),
    ]);

    return {
      currencyName: currencyName.value,
      gameServer,
      session,
    };
  },
  component: Component,
});

function Component() {
  const loaderData = Route.useLoaderData();
  const session = useQuery({ ...userMeQueryOptions(), initialData: loaderData.session });
  const pog = session.data.pogs.find((pog) => pog.gameServerId == loaderData.gameServer.id);
  const { gameServerId } = Route.useParams();

  return (
    <ShopView
      gameServerType={loaderData.gameServer.type}
      gameServerId={gameServerId}
      currencyName={loaderData.currencyName}
      currency={pog?.currency}
    />
  );
}
