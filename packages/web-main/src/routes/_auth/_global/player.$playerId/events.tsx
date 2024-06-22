import { EventFeedWidget } from 'components/events/EventFeedWidget';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/_global/player/$playerId/events')({
  component: Component,
});

function Component() {
  const { playerId } = Route.useParams();
  return <EventFeedWidget query={{ filters: { playerId: [playerId] } }} />;
}
