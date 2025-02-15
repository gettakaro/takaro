import { Button, styled, InfiniteScroll } from '@takaro/lib-components';
import { EventFeed, EventItem } from '../../../components/events/EventFeed';
import { Settings } from 'luxon';
import { eventsInfiniteQueryOptions, useEventSubscription } from '../../../queries/event';
import { HiStop as PauseIcon, HiPlay as PlayIcon, HiArrowPath as RefreshIcon } from 'react-icons/hi2';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { hasPermission } from '../../../hooks/useHasPermission';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useMemo, useState } from 'react';
import { EventFilter, EventFilterInputs } from '../../../components/events/EventFilter';
import { eventFilterSchema } from '../../../components/events/eventFilterSchema';
import { PERMISSIONS } from '@takaro/apiclient';
import { zodValidator } from '@tanstack/zod-adapter';
import { userMeQueryOptions } from '../../../queries/user';

Settings.throwOnInvalid = true;

export const Route = createFileRoute('/_auth/_global/events')({
  validateSearch: zodValidator(eventFilterSchema),
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (
      !hasPermission(session, [
        PERMISSIONS.ReadEvents,
        PERMISSIONS.ManageGameservers,
        PERMISSIONS.ReadPlayers,
        PERMISSIONS.ReadUsers,
        PERMISSIONS.ReadModules,
      ])
    ) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loaderDeps: ({ search: { dateRange, eventNames, playerIds, gameServerIds, moduleIds } }) => ({
    dateRange,
    eventNames,
    playerIds,
    gameServerIds,
    moduleIds,
  }),
  loader: async ({ context, deps }) => {
    const opts = eventsInfiniteQueryOptions({
      sortBy: 'createdAt',
      filters: {
        eventName: deps.eventNames.length > 0 ? deps.eventNames : undefined,
        playerId: deps.playerIds.length > 0 ? deps.playerIds : undefined,
        gameserverId: deps.gameServerIds.length > 0 ? deps.gameServerIds : undefined,
        moduleId: deps.moduleIds.length > 0 ? deps.moduleIds : undefined,
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

  useEventSubscription({
    enabled: live,
    search: { eventName: search.eventNames.length > 0 ? search.eventNames : undefined },
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
      filters: {
        playerId: search.playerIds.length > 0 ? search.playerIds : undefined,
        gameserverId: search.gameServerIds.length > 0 ? search.gameServerIds : undefined,
        eventName: search.eventNames.length > 0 ? search.eventNames : undefined,
        moduleId: search.moduleIds.length > 0 ? search.moduleIds : undefined,
      },
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
        gameServerIds: filter.gameServerIds.length > 0 ? filter.gameServerIds : [],
        playerIds: filter.playerIds.length > 0 ? filter.playerIds : [],
        eventNames: filter.eventNames.length > 0 ? filter.eventNames : [],
        moduleIds: filter.moduleIds.length > 0 ? filter.moduleIds : [],
        startDate: filter.dateRange?.start ?? [],
        endDate: filter.dateRange?.end ?? [],
      }),
    });
  };

  return (
    <>
      <Header>
        <EventFilter
          isLoading={false}
          initialSelectedValues={{
            playerIds: search.playerIds ?? [],
            gameServerIds: search.gameServerIds ?? [],
            eventNames: search.eventNames ?? [],
            dateRange: search.dateRange ?? undefined,
            moduleIds: search.moduleIds ?? [],
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
