import { createFileRoute } from '@tanstack/react-router';
import { Currency } from './-PlayerCurrency';
import { GameServerSelect } from 'components/selects';
import { useForm } from 'react-hook-form';
import { playerQueryOptions } from 'queries/players';
import { FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { playerOnGameServerQueryOptions } from 'queries/pogs';

export const Route = createFileRoute('/_auth/_global/player/$playerId/economy')({
  component: Component,
  loader: async ({ context, params }) => context.queryClient.ensureQueryData(playerQueryOptions(params.playerId)),
});

type FormFields = {
  gameServerId: string | undefined;
};

function Component() {
  const { playerId } = Route.useParams();

  const { control, watch } = useForm<FormFields>({
    mode: 'onChange',
  });
  const gameServerId = watch('gameServerId');

  return (
    <>
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
