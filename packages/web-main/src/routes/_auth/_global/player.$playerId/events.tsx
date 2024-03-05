import { useTheme } from '@takaro/lib-components';
import { EventFeedWidget } from 'components/events/EventFeedWidget';
import { Section } from './-style';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/_global/player/$playerId/events')({
  component: Component,
});

function Component() {
  const { playerId } = Route.useParams();
  const theme = useTheme();
  return (
    <Section style={{ height: '100%', overflowY: 'auto', paddingRight: theme.spacing[2] }}>
      <EventFeedWidget query={{ filters: { playerId: [playerId] } }} />
    </Section>
  );
}
