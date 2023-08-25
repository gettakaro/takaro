import { EventOutputDTO } from '@takaro/apiclient';
import { styled, DatePicker, Button } from '@takaro/lib-components';
import { GenericTextField } from '@takaro/lib-components/src/components/inputs/TextField';
import { EventFeed, EventItem } from 'components/events/EventFeed';
import { EventFilter } from 'components/events/EventFilter';
import { EventFilterTag } from 'components/events/EventFilter/Tag';
import { EventFilterTagList } from 'components/events/EventFilter/TagList';
import { TreeFilter } from 'components/events/TreeFilter';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { useSocket } from 'hooks/useSocket';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { useEvents } from 'queries/events';
import { EnrichedEvent, useEnrichEvent } from 'queries/events/queries';
import { FC, useEffect, useState } from 'react';

import { HiStop as PauseIcon, HiPlay as PlayIcon, HiMagnifyingGlass as SearchIcon } from 'react-icons/hi2';

const ContentContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing['1']};
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing['4']};
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
  margin-bottom: ${({ theme }) => theme.spacing['1']};
`;

const Filters = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: ${({ theme }) => `${theme.spacing[2]}`};
  height: 600px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  min-width: 360px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 1rem;
`;

const ScrollableContainer = styled.div`
  overflow-y: auto;
  display: flex;
  padding-left: 4px;
  padding-right: ${({ theme }) => theme.spacing[4]};
  width: 100%;
  height: 82vh;
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

export type Filter = {
  field: string;
  operator: string;
  value: string;
};

export const Events: FC = () => {
  useDocumentTitle('Events');

  const [startDate, setStartDate] = useState<DateTime | null>(null);
  const [endDate, setEndDate] = useState<DateTime | null>(null);
  const [fields, setFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);

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

  /* TODO: server side filtering or just clean this up with better data structures / typings xD */
  const filteredEvents = events
    ?.filter(
      (event) =>
        fields.includes(event.eventName) &&
        (filters.length === 0 ||
          filters.every((f) => {
            const field = _.get(event, f.field);
            if (field === undefined) return false;

            switch (f.operator) {
              case 'is':
                return String(field) === String(f.value);
              case 'contains':
                return String(field).includes(f.value);
              default:
                return false;
            }
          }))
    )
    .sort((a, b) => {
      return DateTime.fromISO(b.createdAt).diff(DateTime.fromISO(a.createdAt)).milliseconds;
    });

  return (
    <>
      <Header>
        <Flex>
          <EventFilter
            fields={['player.name', 'gameserver.name', 'module.name', 'meta.result.success']}
            addFilter={(filter: Filter) => {
              if (!filters.some((f) => f.field === filter.field && f.operator === filter.operator)) {
                setFilters((prev) => [...prev, filter]);
              }
            }}
          />
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
      <EventFilterTagList>
        {filters.map((filter) => (
          <EventFilterTag
            key={`${filter.field}-${filter.operator}-${filter.value}`}
            {...filter}
            onClear={() => {
              setFilters((prev) => prev.filter((f) => f !== filter));
            }}
            onClick={() => {
              console.log('clicked');
            }}
          />
        ))}
      </EventFilterTagList>
      <ContentContainer>
        {filteredEvents?.length === 0 ? (
          <div style={{ width: '100%', textAlign: 'center', marginTop: '4rem' }}>No events found</div>
        ) : (
          <ScrollableContainer>
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
          </ScrollableContainer>
        )}
        <Filters>
          <h3>Select event types</h3>
          <TreeFilter
            data={treeData}
            addFilters={(f) => {
              setFields((prev) => [...prev, ...f]);
            }}
            removeFilters={(f) => {
              setFields((prev) => prev.filter((filter) => !f.includes(filter)));
            }}
          />
        </Filters>
      </ContentContainer>
    </>
  );
};
