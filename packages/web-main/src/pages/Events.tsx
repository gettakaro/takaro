import { styled } from '@takaro/lib-components';
import { EventFeed, EventItem } from 'components/EventFeed';
import { useEvents } from 'queries/events';
import { FC } from 'react';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 0.75fr;
  width: 100%;
`;

export const Events: FC = () => {
  const { data, isLoading } = useEvents({
    page: 0,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Wrapper>
      <EventFeed>
        {data?.data?.map((event) => (
          <EventItem
            key={event.id}
            eventType={event.eventName}
            data={(event?.meta as Record<string, any> | undefined) ?? {}}
            playerId={event.playerId}
            gameserverId={event.gameserverId}
            moduleId={event.moduleId}
            createdAt={event.createdAt}
            onDetailClick={() => {
              console.log('clicked!');
            }}
          />
        ))}
      </EventFeed>
    </Wrapper>
  );
};
