import { styled } from '@takaro/lib-components';
import { EventFeed, EventItem } from 'components/EventFeed';
import { useEvents } from 'queries/events';
import { FC } from 'react';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
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
        {data?.map((event) => (
          <EventItem
            key={event.id}
            eventType={event.eventName}
            data={(event?.meta as Record<string, any> | undefined) ?? {}}
            playerName={event?.player?.name}
            gamserverName={event?.gameserver?.name}
            moduleName={event?.module?.name}
            commandName={event?.command?.name}
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
