import { Skeleton } from '@takaro/lib-components';
import { redirect, createFileRoute } from '@tanstack/react-router';
import { playerQueryOptions } from 'queries/player';
import { playersOnGameServersQueryOptions } from 'queries/pog';
import { hasPermission } from 'hooks/useHasPermission';
import { PERMISSIONS } from '@takaro/apiclient';
import { FC } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { Currency } from './-player/PlayerCurrency';
import { GameServerSelect } from 'components/selects';
import { useForm } from 'react-hook-form';
import { playerOnGameServerQueryOptions } from 'queries/pog';
import { PlayerDetails } from './-player/PlayerDetails';

type FormFields = {
  gameServerId: string | undefined;
};

export const Route = createFileRoute('/_auth/_global/player/$playerId/economy')({
  beforeLoad: ({ context }) => {
    if (!hasPermission(context.auth.session, [PERMISSIONS.ReadPlayers])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ params, context }) => {
    const [player, pogs] = await Promise.all([
      context.queryClient.ensureQueryData(playerQueryOptions(params.playerId)),
      context.queryClient.ensureQueryData(
        playersOnGameServersQueryOptions({ filters: { playerId: [params.playerId] } })
      ),
    ]);
    return { player, pogs };
  },
  component: Component,
  pendingComponent: () => <Skeleton variant="rectangular" width="100%" height="100%" />,
});

function Component() {
  const { playerId } = Route.useParams();
  const loaderData = Route.useLoaderData();

  const [{ data: player }, { data: pogs }] = useQueries({
    queries: [
      { ...playerQueryOptions(playerId), initialData: loaderData.player },
      { ...playersOnGameServersQueryOptions({ filters: { playerId: [playerId] } }), initialData: loaderData.pogs },
    ],
  });

  const { control, watch } = useForm<FormFields>({
    mode: 'onChange',
  });
  const gameServerId = watch('gameServerId');

  return (
    <>
      <PlayerDetails player={player} pogs={pogs} />
      <GameServerSelect control={control} name="gameServerId" />
      {gameServerId && <CurrencyWrapper playerId={playerId} gameServerId={gameServerId} />}
    </>
  );
}

const CurrencyWrapper: FC<{ playerId: string; gameServerId: string }> = ({ playerId, gameServerId }) => {
  const { data, isPending } = useQuery(playerOnGameServerQueryOptions(gameServerId, playerId));

  if (isPending) {
    return <div>Loading currency data</div>;
  }

  if (!data) {
    return <div>could not load data</div>;
  }

  return <Currency playerId={playerId} gameServerId={gameServerId} currency={data.currency} />;
};
