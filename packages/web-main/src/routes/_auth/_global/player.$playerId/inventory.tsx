import { createFileRoute } from '@tanstack/react-router';
import { Section } from './-style';
// import { PlayerInventoryTable } from './-PlayerInventoryTable';
// import { PlayerOnGameserverOutputDTO } from '@takaro/apiclient';
import { playerQueryOptions } from 'queries/players';

export const Route = createFileRoute('/_auth/_global/player/$playerId/inventory')({
  component: Component,
  loader: async ({ context, params }) => context.queryClient.ensureQueryData(playerQueryOptions(params.playerId)),
});

function Component() {
  // TODO: should get pog here somehow
  // const { pog } = useOutletContext<{ pog: PlayerOnGameserverOutputDTO }>();
  //const pog = {} as PlayerOnGameserverOutputDTO;

  return (
    <Section style={{ minHeight: '250px' }}>
      Temporarily disabled
      {/*<PlayerInventoryTable pog={pog} /> */}
    </Section>
  );
}
