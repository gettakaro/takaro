import { EventOutputDTO } from '@takaro/apiclient';
import { styled, DatePicker, Button } from '@takaro/lib-components';
import { EventFeed, EventItem } from 'components/events/EventFeed';
import { EventFilter } from 'components/events/EventFilter';
import { EventFilterTag } from 'components/events/EventFilter/Tag';
import { EventFilterTagList } from 'components/events/EventFilter/TagList';
import { EventSearch } from 'components/events/EventSearch';
import { TreeFilter } from 'components/events/TreeFilter';
import { Filter } from 'components/events/types';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { useSocket } from 'hooks/useSocket';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { useEvents } from 'queries/events';
import { EnrichedEvent, useEnrichEvent } from 'queries/events/queries';
import { FC, useEffect, useState } from 'react';

import { HiStop as PauseIcon, HiPlay as PlayIcon, HiArrowPath as RefreshIcon } from 'react-icons/hi2';

const ContentContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing['1']};
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing['4']};
  width: 100%;
`;

const Flex = styled.div`
  width: 100%;
  display: flex;
  gap: ${({ theme }) => theme.spacing['1']};
`;

const EventFilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['1']};
  margin-bottom: ${({ theme }) => theme.spacing['1']};
  align-items: center;
  width: 100%;
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
  height: 80vh;
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
    defaultEnabled: true,
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
    name: 'Global',
    children: [
      {
        name: 'role-created',
      },
      {
        name: 'role-assigned',
      },
    ],
  },
];

const allFields = ['moduleId', 'gameserverId', 'playerId'];

export const Events: FC = () => {
  useDocumentTitle('Events');

  const [startDate, setStartDate] = useState<DateTime | null>(null);
  const [endDate, setEndDate] = useState<DateTime | null>(null);

  const [fields, setFields] = useState<string[]>([]);
  const [tagFilters, setTagFilters] = useState<Filter[]>([]);
  const [searchFilters, setSearchFilters] = useState<Filter[]>([]);

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

  const filters = [...tagFilters, ...searchFilters];
  const filterFields = filters
    .filter((f) => f.operator === ':')
    .reduce((acc, f) => {
      acc[f.field] = [f.value];
      return acc;
    }, {});

  const {
    data: rawEvents,
    refetch,
    InfiniteScroll,
  } = useEvents({
    search: { eventName: fields },
    filters: filterFields,
    sortBy: 'createdAt',
    sortDirection: 'desc',
    startDate: startDate?.toISO() ?? undefined,
    endDate: endDate?.toISO() ?? undefined,
  });

  useEffect(() => {
    if (rawEvents) {
      setEvents(rawEvents.pages.flatMap((page) => page.data));
    }
  }, [rawEvents]);

  const handleDatePicker = (start: DateTime, end: DateTime) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <>
      <Header>
        <Flex>
          <EventFilter
            mode="add"
            fields={allFields}
            addFilter={(filter: Filter) => {
              if (!tagFilters.some((f) => f.field === filter.field && f.operator === filter.operator)) {
                setTagFilters((prev) => [...prev, filter]);
              }
            }}
          />
          <EventSearch
            fields={allFields}
            conjunctions={['and']}
            operators={[':']}
            getValueOptions={(field) => {
              return _.uniq(
                events
                  ?.map((e) => {
                    // TODO: this is a hack, we should have a better way to get the value
                    if (field.endsWith('Id')) {
                      const type = field.split('Id')[0];
                      return String(_.get(e, `${type}.id`));
                    }

                    return String(_.get(e, field));
                  })
                  .filter((e) => e !== 'undefined')
              );
            }}
            setFilters={setSearchFilters}
          />
        </Flex>
        <DatePicker id="1" onChange={handleDatePicker} />
        <Button
          text="Live"
          icon={live ? <PauseIcon /> : <PlayIcon />}
          onClick={() => setLive(!live)}
          color={live ? 'primary' : 'secondary'}
        />
        <Button text="Refresh" icon={<RefreshIcon />} onClick={() => refetch()} color={'secondary'} />
      </Header>
      <EventFilterTagList>
        {tagFilters.map((filter) => (
          <EventFilterTag
            fields={allFields}
            key={`${filter.field}-${filter.operator}-${filter.value}`}
            editFilter={(f) => {
              setTagFilters((prev) => prev.map((filter) => (filter.field === f.field ? f : filter)));
            }}
            onClear={() => {
              setTagFilters((prev) => prev.filter((f) => f !== filter));
            }}
            filter={filter}
          />
        ))}
      </EventFilterTagList>
      <ContentContainer>
        {events?.length === 0 ? (
          <div style={{ width: '100%', textAlign: 'center', marginTop: '4rem' }}>No events found</div>
        ) : (
          <EventFilterContainer>
            <ScrollableContainer>
              <EventFeed>
                {events?.map((event) => (
                  <EventItem key={event.id} event={event} onDetailClick={() => {}} />
                ))}
              </EventFeed>
            </ScrollableContainer>
            {InfiniteScroll}
          </EventFilterContainer>
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
