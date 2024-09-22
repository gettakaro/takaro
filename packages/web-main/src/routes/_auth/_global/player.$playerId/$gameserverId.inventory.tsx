import { createFileRoute } from '@tanstack/react-router';
import { Section } from './-style';
import { PlayerInventoryTable } from './-PlayerInventoryTable';
import { playerOnGameServerQueryOptions } from 'queries/pog';

export const Route = createFileRoute('/_auth/_global/player/$playerId/$gameserverId/inventory')({
  component: Component,

  loader: async ({ context, params }) => {
    return await context.queryClient.ensureQueryData(
      playerOnGameServerQueryOptions(params.gameserverId, params.playerId),
    );
  },
});

function Component() {
  const pog = Route.useLoaderData();
  return <Section style={{ minHeight: '250px' }}>{<PlayerInventoryTable pog={pog} />}</Section>;
}
