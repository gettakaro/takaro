import { useTheme } from '@takaro/lib-components';
import { EventFeedWidget } from 'components/events/EventFeedWidget';
import { Section } from './-style';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/player/$playerId/events')({
  component: Component,
});

function Component() {
  const { selectedGameServerId } = useSelectedGameServer();
  // TODO: should get the pog from somewhere
  // const { pog } = useOutletContext<{ pog: PlayerOnGameserverOutputDTO }>();
  const { playerId } = Route.useParams();

  const theme = useTheme();

  return (
    <Section style={{ height: '100%', overflowY: 'auto', paddingRight: theme.spacing[2] }}>
      <EventFeedWidget query={{ filters: { playerId: [playerId], gameserverId: [selectedGameServerId] } }} />
    </Section>
  );
}
