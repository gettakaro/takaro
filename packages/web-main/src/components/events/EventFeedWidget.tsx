import { EventOutputDTO, EventSearchInputDTO } from '@takaro/apiclient';
import { EventFeed, EventItem } from 'components/events/EventFeed';
import { useEvents } from 'queries/events';
import { FC, useEffect, useState } from 'react';

interface IProps {
  query: EventSearchInputDTO;
}

export const EventFeedWidget: FC<IProps> = ({ query }) => {
  const [events, setEvents] = useState<EventOutputDTO[]>([]);

  const {
    data: rawEvents,
    isLoading,
    InfiniteScroll,
  } = useEvents({
    ...query,
    extend: ['gameServer', 'module', 'player', 'user'],
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });

  useEffect(() => {
    if (rawEvents) {
      setEvents(rawEvents.pages.flatMap((page) => page.data));
    }
  }, [rawEvents]);

  if (isLoading || !rawEvents) return <div>Loading...</div>;

  return (
    <EventFeed>
      {events.flatMap((event) => (
        <EventItem key={event.id} event={event} onDetailClick={() => {}} />
      ))}
      {InfiniteScroll}
    </EventFeed>
  );
};
