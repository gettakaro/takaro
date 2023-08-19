import { EventOutputDTO } from '@takaro/apiclient';
import { styled, DatePicker, Button } from '@takaro/lib-components';
import { GenericTextField } from '@takaro/lib-components/src/components/inputs/TextField';
import { EventFeed, EventItem } from 'components/EventFeed';
import { TreeFilter } from 'components/TreeFilter';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { useSocket } from 'hooks/useSocket';
import { DateTime } from 'luxon';
import { useEvents } from 'queries/events';
import { EnrichedEvent, useEnrichEvent } from 'queries/events/queries';
import { FC, useEffect, useState } from 'react';

import { HiStop as PauseIcon, HiPlay as PlayIcon, HiMagnifyingGlass as SearchIcon } from 'react-icons/hi2';

const ContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing['8']};
  width: 100%;
`;

const StyledTextField = styled(GenericTextField)`
  width: 100%;
`;

const Flex = styled.div`
  width: 100%;
  display: flex;
  gap: ${({ theme }) => theme.spacing['1']};
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  gap: ${({ theme }) => theme.spacing['1']};
  margin-bottom: ${({ theme }) => theme.spacing['2']};
`;

const Filters = styled.div`
  min-width: 300px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 1rem;
`;

const treeData = [
  {
    name: 'Gameserver',
    children: [
      {
        name: 'player-connected',
      },
      {
        name: 'player-disconnected',
      },
      {
        name: 'chat-message',
      },
    ],
  },
  {
    name: 'Module',
    children: [
      {
        name: 'cronjob-executed',
      },
      {
        name: 'hook-executed',
      },
      {
        name: 'command-executed',
      },
    ],
  },
  {
    name: 'Domain',
    children: [
      {
        name: 'Role created',
      },
      {
        name: 'Role assigned',
      },
    ],
  },
];

export const Events: FC = () => {
  useDocumentTitle('Events');

  const [startDate, setStartDate] = useState<DateTime | null>(null);
  const [endDate, setEndDate] = useState<DateTime | null>(null);
  const [filters, setFilters] = useState<string[]>([]);

  const [live, setLive] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<EventOutputDTO | null>(null);
  const [events, setEvents] = useState<EnrichedEvent[] | null>(null);

  const { socket } = useSocket();

  useEffect(() => {
    if (!live) {
      socket.off('event');
      return;
    }
    refetch();

    socket.on('event', (event: EventOutputDTO) => {
      setLastEvent(event);
    });
  }, [live]);

  const { data: lastEventResponse } = useEnrichEvent(lastEvent);

  // TODO: server side filtering
  const { data: rawEvents, refetch } = useEvents({
    sortBy: 'createdAt',
    sortDirection: 'desc',
    startDate: startDate?.toISO() ?? undefined,
    endDate: endDate?.toISO() ?? undefined,
  });

  useEffect(() => {
    if (rawEvents) {
      setEvents(rawEvents);
    }
  }, [rawEvents]);

  useEffect(() => {
    if (lastEventResponse) {
      setEvents((prev) => {
        if (prev) {
          console.log('adding event');
          return [lastEventResponse, ...prev];
        }
        return [lastEventResponse];
      });
    }
  }, [lastEventResponse]);

  const handleDatePicker = (start: DateTime, end: DateTime) => {
    setStartDate(start);
    setEndDate(end);
  };

  const addFilters = (filters: string[]) => {
    setFilters((prev) => {
      return [...prev, ...filters];
    });
  };

  const removeFilters = (filters: string[]) => {
    setFilters((prev) => {
      return prev.filter((filter) => !filters.includes(filter));
    });
  };

  const filteredEvents = events
    ?.filter((event) => filters.includes(event.eventName))
    .sort((a, b) => {
      return DateTime.fromISO(b.createdAt).diff(DateTime.fromISO(a.createdAt)).milliseconds;
    });

  return (
    <>
      <Header>
        <Flex>
          <Button text="Filters" />
          <StyledTextField
            icon={<SearchIcon />}
            name="search"
            placeholder="Search"
            id="1"
            onChange={() => {}}
            value=""
            hasDescription={false}
            hasError={false}
          />
        </Flex>
        <DatePicker id="1" onChange={handleDatePicker} />
        <Button
          text="Live"
          icon={live ? <PauseIcon /> : <PlayIcon />}
          onClick={() => setLive(!live)}
          color={live ? 'primary' : 'secondary'}
        />
      </Header>
      <ContentContainer>
        {filteredEvents?.length === 0 ? (
          <div style={{ width: '100%', textAlign: 'center', marginTop: '4rem' }}>No events found</div>
        ) : (
          <EventFeed>
            {filteredEvents?.map((event) => (
              <EventItem
                key={event.id}
                eventType={event.eventName}
                data={(event?.meta as Record<string, any> | undefined) ?? {}}
                playerName={event?.player?.name}
                gamserverName={event?.gameserver?.name}
                moduleName={event?.module?.name}
                commandName={event?.command?.name}
                createdAt={event.createdAt}
                onDetailClick={() => {}}
              />
            ))}
          </EventFeed>
        )}
        <Filters>
          {/* TODO: maybe find a better name since we already have Quick select in the datepicker */}
          <h3>Quick select</h3>
          <TreeFilter data={treeData} addFilters={addFilters} removeFilters={removeFilters} />
        </Filters>
      </ContentContainer>
    </>
  );
};
