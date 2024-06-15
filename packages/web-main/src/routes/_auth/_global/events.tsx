import { DateRangePicker, Button, styled, InfiniteScroll } from '@takaro/lib-components';
import { EventOutputDTOEventNameEnum as EventName } from '@takaro/apiclient';
import { EventFeed, EventItem } from 'components/events/EventFeed';
import { TreeFilter, TreeNode } from 'components/events/TreeFilter';
import { Filter } from 'components/events/types';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import _ from 'lodash';
import { DateTime, Settings } from 'luxon';
import { eventsInfiniteQueryOptions, useEventSubscription } from 'queries/event';
import { HiStop as PauseIcon, HiPlay as PlayIcon, HiArrowPath as RefreshIcon } from 'react-icons/hi2';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { hasPermission } from 'hooks/useHasPermission';
import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

Settings.throwOnInvalid = true;

const treeData: TreeNode[] = [
  {
    name: 'Gameserver',
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

function updateTreeDataWithDefaultEnabled(treeData: TreeNode[], eventNames: string[]): TreeNode[] {
  return treeData.map((node) => {
    const updatedChildren = node.children ? updateTreeDataWithDefaultEnabled(node.children, eventNames) : undefined;

    return {
      ...node,
      children: updatedChildren,
      defaultEnabled: node.children ? undefined : eventNames.includes(node.name),
    };
  });
}

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

const eventSearchSchema = z.object({
  startDate: z.string().optional().catch(undefined), // There is a datetime() on string, but it's not working as expected.
  endDate: z.string().optional().catch(undefined),
  eventNames: z.array(z.nativeEnum(EventName)).optional().default([]),
});
type EventSearch = z.infer<typeof eventSearchSchema>;

export const Route = createFileRoute('/_auth/_global/events')({
  validateSearch: eventSearchSchema,
  beforeLoad: async ({ context }) => {
    if (!hasPermission(context.auth.session, ['READ_EVENTS', 'READ_GAMESERVERS', 'READ_PLAYERS', 'READ_USERS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loaderDeps: ({ search: { endDate, startDate, eventNames } }) => ({ startDate, endDate, eventNames }),
  loader: async ({ context, deps }) => {
    const opts = eventsInfiniteQueryOptions({
      sortBy: 'createdAt',
      search: { eventName: deps.eventNames.length > 0 ? deps.eventNames : undefined },
      sortDirection: 'desc',
      extend: ['gameServer', 'module', 'player', 'user'],
      greaterThan: { createdAt: deps.startDate },
      lessThan: { createdAt: deps.endDate },
    });
    const data =
      context.queryClient.getQueryData(opts.queryKey) ?? (await context.queryClient.fetchInfiniteQuery(opts));
    return data;
  },
  component: Component,
});

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
  justify-content: flex-end;
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
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  padding: ${({ theme }) => `${theme.spacing[2]}`};
  min-height: 600px;
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

function Component() {
  useDocumentTitle('Events');
  const loaderData = Route.useLoaderData();

  const navigate = useNavigate({ from: Route.fullPath });
  const { startDate, endDate, eventNames } = Route.useSearch();
  const [live, setLive] = useState<boolean>(true);
  const updatedTreeData = useMemo(() => updateTreeDataWithDefaultEnabled(treeData, eventNames), [eventNames]);

  const filters: Filter[] = [];
  const filterFields = filters.reduce((acc, f) => {
    acc[f.field] = [f.value];
    return acc;
  }, {});

  useEventSubscription({
    enabled: live,
    search: { eventName: eventNames.length > 0 ? eventNames : undefined },
    filters: filterFields,
    greaterThan: { createdAt: startDate },
    lessThan: { createdAt: endDate },
  });

  const {
    data: rawEvents,
    refetch,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...eventsInfiniteQueryOptions({
      search: { eventName: eventNames.length > 0 ? eventNames : undefined },
      filters: filterFields,
      sortBy: 'createdAt',
      sortDirection: 'desc',
      greaterThan: { createdAt: live ? undefined : startDate },
      lessThan: { createdAt: live ? undefined : endDate },
      extend: ['gameServer', 'module', 'player', 'user'],
    }),
    initialData: loaderData,
  });

  const events = useMemo(() => {
    return rawEvents.pages.flatMap((page) => page.data);
  }, [rawEvents]);

  const handleDateRangePicker = useCallback(
    (start: DateTime<true>, end: DateTime<true>) => {
      navigate({
        search: (prev: EventSearch) => ({ ...prev, startDate: start.toISO(), endDate: end.toISO() }),
      });
    },
    [navigate]
  );

  return (
    <>
      <Header>
        <Flex>
          <DateRangePicker
            id="event-daterange-picker"
            onChange={handleDateRangePicker}
            disabled={live}
            defaultValue={
              startDate && endDate
                ? {
                    start: DateTime.fromISO(startDate) as DateTime<true>,
                    end: DateTime.fromISO(endDate) as DateTime<true>,
                  }
                : undefined
            }
          />
          <Button
            text={live ? 'Pause' : 'Go Live'}
            icon={live ? <PauseIcon /> : <PlayIcon />}
            onClick={() => setLive(!live)}
            color={live ? 'primary' : 'secondary'}
          />
          <Button
            isLoading={isFetching}
            disabled={live || isFetching}
            text="Refresh feed"
            icon={<RefreshIcon />}
            onClick={() => refetch()}
            color={'secondary'}
          />
        </Flex>
      </Header>
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
                <InfiniteScroll
                  isFetching={isFetching}
                  hasNextPage={hasNextPage}
                  fetchNextPage={fetchNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                />
              </EventFeed>
            </ScrollableContainer>
          </EventFilterContainer>
        )}
        <Filters>
          <h3>Filter event types</h3>
          <TreeFilter
            data={updatedTreeData}
            addFilters={(f) => {
              navigate({
                search: (prev: EventSearch) => ({
                  ...prev,
                  eventNames: _.uniq([...prev.eventNames, ...f] as EventSearch['eventNames']),
                }),
              });
            }}
            removeFilters={(f) => {
              navigate({
                search: (prev: EventSearch) => ({
                  ...prev,
                  eventNames: prev.eventNames.filter((filter) => !f.includes(filter)),
                }),
              });
            }}
          />
        </Filters>
      </ContentContainer>
    </>
  );
}
