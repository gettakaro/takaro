import { createFileRoute } from '@tanstack/react-router';
import { Section } from './-style';
import { PlayerInventoryTable } from './-PlayerInventoryTable';
import { PlayerOnGameserverOutputDTO } from '@takaro/apiclient';

export const Route = createFileRoute('/_auth/_global/player/$playerId/inventory')({
  component: Component,
});

function Component() {
  // TODO: should get pog here somehow
  // const { pog } = useOutletContext<{ pog: PlayerOnGameserverOutputDTO }>();
  const pog = {} as PlayerOnGameserverOutputDTO;

  if (!pog) {
    return null;
  }

  return (
    <Section style={{ minHeight: '250px' }}>
      <PlayerInventoryTable pog={pog} />
    </Section>
  );
}
