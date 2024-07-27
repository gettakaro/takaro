import { EventOutputDTO, EventSearchInputDTO } from '@takaro/apiclient';
import { Skeleton } from '@takaro/lib-components';
import { useQuery } from '@tanstack/react-query';
import { EventFeed, EventItem } from 'components/events/EventFeed';
import { eventsQueryOptions } from 'queries/event';
import { FC, useEffect, useState } from 'react';

interface IProps {
  query: EventSearchInputDTO;
}

export const EventFeedWidget: FC<IProps> = ({ query }) => {
  const [events, setEvents] = useState<EventOutputDTO[]>([]);

  const { data: rawEvents, isLoading } = useQuery(
    eventsQueryOptions({
      ...query,
      extend: ['gameServer', 'module', 'player', 'user'],
      sortBy: 'createdAt',
      sortDirection: 'desc',
    }),
  );

  useEffect(() => {
    if (rawEvents) {
      setEvents(rawEvents.data);
    }
  }, [rawEvents]);

  if (isLoading || !rawEvents) return <Skeleton variant="rectangular" width="100%" height="100%" />;

  if (events.length === 0) return <p>No events found</p>;

  return (
    <EventFeed>
      {events.flatMap((event) => (
        <EventItem key={event.id} event={event} onDetailClick={() => {}} />
      ))}
      {/* TODO: set events*/}
      {/*InfiniteScroll*/}
    </EventFeed>
  );
};
