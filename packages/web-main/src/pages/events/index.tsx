import {
  EventOutputDTO,
  EventOutputDTOEventNameEnum as EventName,
  EventSearchInputAllowedFilters,
} from '@takaro/apiclient';
import { DateRangePicker, Button } from '@takaro/lib-components';
import { EventFeed, EventItem } from 'components/events/EventFeed';
import { EventFilter } from 'components/events/EventFilter';
import { EventFilterTag } from 'components/events/EventFilter/Tag';
import { EventFilterTagList } from 'components/events/EventFilter/TagList';
import { EventSearch } from 'components/events/EventSearch';
import { TreeFilter, TreeNode } from 'components/events/TreeFilter';
import { Filter, Operator } from 'components/events/types';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { useSocket } from 'hooks/useSocket';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { useEvents } from 'queries/events';
import { FC, useEffect, useState } from 'react';

import { HiStop as PauseIcon, HiPlay as PlayIcon, HiArrowPath as RefreshIcon } from 'react-icons/hi2';
import { ContentContainer, EventFilterContainer, Filters, Flex, Header, ScrollableContainer } from './style';

const treeData: TreeNode[] = [
  {
    name: 'Gameserver',
    defaultEnabled: true,
    children: [
      {
        name: EventName.PlayerConnected,
      },
      {
        name: EventName.PlayerDisconnected,
      },
      {
        name: EventName.ChatMessage,
      },
      {
        name: EventName.PlayerDeath,
      },
      {
        name: EventName.EntityKilled,
      },
      {
        name: EventName.PlayerNewIpDetected,
      },
      {
        name: EventName.ServerStatusChanged,
      },
      {
        name: EventName.PlayerCreated,
      },
    ],
  },
  {
    name: 'Module',
    defaultEnabled: true,
    children: [
      {
        name: EventName.CronjobExecuted,
      },
      {
        name: EventName.HookExecuted,
      },
      {
        name: EventName.CommandExecuted,
      },
      {
        name: EventName.ModuleCreated,
      },
      {
        name: EventName.ModuleDeleted,
      },
      {
        name: EventName.ModuleUpdated,
      },
      {
        name: EventName.ModuleInstalled,
      },
      {
        name: EventName.ModuleUninstalled,
      },
    ],
  },
  {
    name: 'Economy',
    children: [
      {
        name: EventName.CurrencyAdded,
      },
      {
        name: EventName.CurrencyDeducted,
      },
    ],
  },
  {
    name: 'Global',
    children: [
      {
        name: EventName.RoleAssigned,
      },
      {
        name: EventName.RoleRemoved,
      },
      {
        name: EventName.RoleCreated,
      },
      {
        name: EventName.RoleUpdated,
      },
      {
        name: EventName.RoleDeleted,
      },
      {
        name: EventName.SettingsSet,
      },
    ],
  },
];

const allFields = ['moduleId', 'gameserverId', 'playerId'];

function clientSideFilter(
  event: EventOutputDTO,
  eventTypes: EventName[],
  filters: Filter[],
  startDate: DateTime | null,
  endDate: DateTime | null
) {
  const createdAt = DateTime.fromISO(event.createdAt);
  if ((startDate && createdAt < startDate) || (endDate && createdAt > endDate)) {
    return false;
  }

  if (!eventTypes.includes(event.eventName)) {
    return false;
  }

  if (filters.length > 0) {
    return filters.every((filter) => {
      const value = _.get(event, filter.field);
      switch (filter.operator) {
        case Operator.is:
          return filter.value === value;
        default:
          return false;
      }
    });
  }

  return true;
}

export const Events: FC = () => {
  useDocumentTitle('Events');

  const [startDate, setStartDate] = useState<DateTime | null>(null);
  const [endDate, setEndDate] = useState<DateTime | null>(null);

  const [eventTypes, setEventTypes] = useState<EventName[]>([]);
  const [tagFilters, setTagFilters] = useState<Filter[]>([]);
  const [searchFilters, setSearchFilters] = useState<Filter[]>([]);

  const [live, setLive] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<EventOutputDTO | null>(null);
  const [events, setEvents] = useState<EventOutputDTO[] | null>(null);

  const { socket } = useSocket();

  // If there are any events that are not in the treeData at this point, they're added to a new group called "Other"
  const allEvents = Object.values(EventName);
  const treeEvents = treeData.flatMap((branch) => branch.children?.map((node) => node.name) ?? []);
  const otherEvents = allEvents.filter((event) => !treeEvents.includes(event));
  if (otherEvents.length > 0) {
    treeData.push({
      name: 'Other',
      children: otherEvents.map((event) => ({ name: event })),
    });
  }

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

  const filters = [...tagFilters, ...searchFilters];
  const filterFields = filters.reduce((acc, f) => {
    acc[f.field] = [f.value];
    return acc;
  }, {});

  const lastEventFilters: EventSearchInputAllowedFilters = {};

  if (lastEvent) {
    lastEventFilters.id = [lastEvent.id];
  }

  const { data: lastEventResponse } = useEvents({
    filters: lastEventFilters,
    extend: ['gameServer', 'module', 'player', 'user'],
  });

  useEffect(() => {
    if (
      lastEventResponse &&
      clientSideFilter(lastEventResponse.pages[0].data[0], eventTypes, filters, startDate, endDate)
    ) {
      setEvents((prev) => {
        if (prev) {
          return [lastEventResponse.pages[0].data[0], ...prev];
        }
        return [lastEventResponse.pages[0].data[0]];
      });
    }
  }, [lastEventResponse]);

  const {
    data: rawEvents,
    refetch,
    InfiniteScroll,
  } = useEvents({
    search: { eventName: eventTypes },
    filters: filterFields,
    sortBy: 'createdAt',
    sortDirection: 'desc',
    startDate: startDate?.toISO() ?? undefined,
    endDate: endDate?.toISO() ?? undefined,
    extend: ['gameServer', 'module', 'player', 'user'],
  });

  useEffect(() => {
    if (rawEvents) {
      setEvents(rawEvents.pages.flatMap((page) => page.data));
    }
  }, [rawEvents]);

  const handleDateRangePicker = (start: DateTime, end: DateTime) => {
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
        <DateRangePicker id="1" onChange={handleDateRangePicker} />
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
                {InfiniteScroll}
              </EventFeed>
            </ScrollableContainer>
          </EventFilterContainer>
        )}
        <Filters>
          <h3>Filter event types</h3>
          <TreeFilter
            data={treeData}
            addFilters={(f) => {
              setEventTypes((prev) => [...prev, ...f] as EventName[]);
            }}
            removeFilters={(f) => {
              setEventTypes((prev) => prev.filter((filter) => !f.includes(filter)));
            }}
          />
        </Filters>
      </ContentContainer>
    </>
  );
};
