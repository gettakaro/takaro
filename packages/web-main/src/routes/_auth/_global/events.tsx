import { Button, styled, InfiniteScroll } from '@takaro/lib-components';
import { EventFeed, EventItem } from 'components/events/EventFeed';
import { Filter } from 'components/events/types';
import { Settings } from 'luxon';
import { eventsInfiniteQueryOptions, useEventSubscription } from 'queries/event';
import { HiStop as PauseIcon, HiPlay as PlayIcon, HiArrowPath as RefreshIcon } from 'react-icons/hi2';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { hasPermission } from 'hooks/useHasPermission';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { useMemo, useState } from 'react';
import { EventFilter, EventFilterInputs, eventFilterSchema } from 'components/events/EventFilter';

Settings.throwOnInvalid = true;

export const Route = createFileRoute('/_auth/_global/events')({
  validateSearch: eventFilterSchema,
  beforeLoad: async ({ context }) => {
    const session = await context.auth.getSession();
    if (!hasPermission(session, ['READ_EVENTS', 'READ_GAMESERVERS', 'READ_PLAYERS', 'READ_USERS', 'READ_MODULES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loaderDeps: ({ search: { dateRange, eventNames, playerIds, gameServerIds } }) => ({
    dateRange,
    eventNames,
    playerIds,
    gameServerIds,
  }),
  loader: async ({ context, deps }) => {
    const opts = eventsInfiniteQueryOptions({
      sortBy: 'createdAt',
      search: {
        eventName: deps.eventNames.length > 0 ? deps.eventNames : undefined,
        playerId: deps.playerIds.length > 0 ? deps.playerIds : undefined,
        gameserverId: deps.gameServerIds.length > 0 ? deps.gameServerIds : undefined,
      },
      sortDirection: 'desc',
      extend: ['gameServer', 'module', 'player', 'user'],
      greaterThan: { createdAt: deps.dateRange?.start },
      lessThan: { createdAt: deps.dateRange?.end },
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
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['1']};
  margin-bottom: ${({ theme }) => theme.spacing['1']};
`;

const ScrollableContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 4px;
  padding-right: ${({ theme }) => theme.spacing[4]};
  width: 100%;
  height: 80vh;
`;

function Component() {
  useDocumentTitle('Events');
  const loaderData = Route.useLoaderData();

  const navigate = useNavigate({ from: Route.fullPath });
  const search = Route.useSearch();
  const [live, setLive] = useState<boolean>(true);

  const filters: Filter[] = [];
  const filterFields = filters.reduce((acc, f) => {
    acc[f.field] = [f.value];
    return acc;
  }, {});

  useEventSubscription({
    enabled: live,
    search: { eventName: search.eventNames.length > 0 ? search.eventNames : undefined },
    filters: filterFields,
    greaterThan: { createdAt: search.dateRange?.start },
    lessThan: { createdAt: search.dateRange?.end },
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
      search: { eventName: search.eventNames.length > 0 ? search.eventNames : undefined },
      filters: filterFields,
      sortBy: 'createdAt',
      sortDirection: 'desc',
      greaterThan: { createdAt: live ? undefined : search.dateRange?.start },
      lessThan: { createdAt: live ? undefined : search.dateRange?.end },
      extend: ['gameServer', 'module', 'player', 'user'],
    }),
    initialData: loaderData,
  });

  const events = useMemo(() => {
    return rawEvents.pages.flatMap((page) => page.data);
  }, [rawEvents]);

  const onFilterChangeSubmit = (filter: EventFilterInputs) => {
    navigate({
      search: () => ({
        gameServerIds: filter.gameServerIds.length > 0 ? (filter.gameServerIds as any) : undefined,
        playerIds: filter.playerIds.length > 0 ? (filter.playerIds as any) : undefined,
        eventNames: filter.eventNames.length > 0 ? (filter.eventNames as any) : undefined,
        startDate: filter.dateRange?.start ?? undefined,
        endDate: filter.dateRange?.end ?? undefined,
      }),
    });
  };

  return (
    <>
      <Header>
        <EventFilter
          defaultValues={{
            playerIds: search.playerIds ?? [],
            gameServerIds: search.gameServerIds ?? [],
            eventNames: search.eventNames ?? [],
            dateRange: search.dateRange ?? undefined,
          }}
          onSubmit={onFilterChangeSubmit}
          isLive={live}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
          <Button
            text={live ? 'Pause event feed' : 'Show live event feed'}
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
        </div>
      </Header>
      <ContentContainer>
        {events?.length === 0 ? (
          <div style={{ width: '100%', textAlign: 'center', marginTop: '4rem' }}>No events found</div>
        ) : (
          <EventFilterContainer>
            <ScrollableContainer>
              <EventFeed>
                {events?.map((event) => <EventItem key={event.id} event={event} onDetailClick={() => {}} />)}
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
      </ContentContainer>
    </>
  );
}
