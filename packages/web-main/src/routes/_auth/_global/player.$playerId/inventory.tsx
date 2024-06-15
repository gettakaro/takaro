import { createFileRoute } from '@tanstack/react-router';
import { Section } from './-style';
import { GameServerSelect } from 'components/selects';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { playerOnGameServerQueryOptions } from 'queries/pog';
import { PlayerInventoryTable } from './-PlayerInventoryTable';

export const Route = createFileRoute('/_auth/_global/player/$playerId/inventory')({
  component: Component,
});

function Component() {
  const { playerId } = Route.useParams();
  const { control, watch } = useForm<{ gameServerId: string | undefined }>({
    mode: 'onChange',
  });
  const gameServerId = watch('gameServerId');

  const { data: pog } = useQuery({
    ...playerOnGameServerQueryOptions(gameServerId!, playerId),
    enabled: !!gameServerId && !!playerId,
  });

  return (
    <Section style={{ minHeight: '250px' }}>
      <GameServerSelect name="gameServerId" control={control} />
      {pog && <PlayerInventoryTable pog={pog} />}
    </Section>
  );
}
