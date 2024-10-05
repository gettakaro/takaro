import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Currency } from './-PlayerCurrency';
import { GameServerSelectQueryField } from 'components/selects';
import { useForm } from 'react-hook-form';
import { playersOnGameServersQueryOptions } from 'queries/pog';
import { gameServerSettingQueryOptions } from 'queries/setting';
import { Alert } from '@takaro/lib-components';

export const Route = createFileRoute('/_auth/_global/player/$playerId/economy')({
  component: Component,
  loader: async ({ context, params }) =>
    context.queryClient.ensureQueryData(playersOnGameServersQueryOptions({ filters: { playerId: [params.playerId] } })),
});

type FormFields = {
  gameServerId: string | undefined;
};

function Component() {
  const { playerId } = Route.useParams();
  const loadedPogs = Route.useLoaderData();

  const { data } = useQuery({
    ...playersOnGameServersQueryOptions({ filters: { playerId: [playerId] } }),
    initialData: loadedPogs,
  });

  const { control, watch } = useForm<FormFields>({
    mode: 'onChange',
  });
  const gameServerId = watch('gameServerId');

  const { data: economyEnabledSetting } = useQuery({
    ...gameServerSettingQueryOptions('economyEnabled', gameServerId!),
    enabled: !!gameServerId,
  });
  const economyEnabled = economyEnabledSetting?.value === 'true' ? true : false;

  const gameServerIds = data.data?.map((pog) => pog.gameServerId) ?? [];

  if (gameServerIds.length === 0) {
    return <div>This player has not played on any existing game servers.</div>;
  }

  return (
    <>
      {!economyEnabled && gameServerId && (
        <Alert
          variant="info"
          text="Economy is disabled for this server, some actions will be unavailable. To enable economy, go to the game server settings."
          dismiss
        />
      )}
      <GameServerSelectQueryField
        control={control}
        name="gameServerId"
        filter={(gameServer) => gameServerIds.includes(gameServer.id)}
      />
      {gameServerId && <Currency playerId={playerId} gameServerId={gameServerId} economyEnabled={economyEnabled} />}
    </>
  );
}
