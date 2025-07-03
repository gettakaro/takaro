import { Button, styled, InfiniteScroll, Chip, Skeleton } from '@takaro/lib-components';
import { VariableSizeList } from 'react-window';
import Autosizer from 'react-virtualized-auto-sizer';
import { EventFeed, EventItem } from '../../../components/events/EventFeed';
import { Settings } from 'luxon';
import { eventsInfiniteQueryOptions } from '../../../queries/event';
import { HiArrowPath as RefreshIcon } from 'react-icons/hi2';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { FC, useEffect, useMemo, useState, useRef, useCallback, forwardRef } from 'react';
import { hasPermission } from '../../../hooks/useHasPermission';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { EventFilter, EventFilterInputs } from '../../../components/events/EventFilter';
import { eventFilterSchema } from '../../../components/events/eventFilterSchema';
import { PERMISSIONS, EventOutputDTO } from '@takaro/apiclient';
import { zodValidator } from '@tanstack/zod-adapter';
import { userMeQueryOptions } from '../../../queries/user';
import { useEventGrouping, isEventGroup } from '../../../hooks/useEventGrouping';

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

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['2']};
  padding: ${({ theme }) => theme.spacing['3']};
  border-bottom: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  background: ${({ theme }) => theme.colors.background};
  z-index: 10;
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing['2']};
`;

const QuickFilters = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing['1']};
  margin-bottom: ${({ theme }) => theme.spacing['2']};
`;

const ActiveFilters = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing['1']};
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing['2']};
`;

const TimelineContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing['3']};
  background: ${({ theme }) => theme.colors.backgroundAlt};
`;

const ScrollableContainer = styled.div`
  flex: 1;
  position: relative;
`;

const EventGroup = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing['4']};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing['3']};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  
  &::before {
    content: '';
    position: absolute;
    left: -${({ theme }) => theme.spacing['6']};
    top: ${({ theme }) => theme.spacing['3']};
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    border: 3px solid ${({ theme }) => theme.colors.backgroundAlt};
    z-index: 2;
  }
`;

const GroupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing['2']};
  
  h4 {
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize.medium};
    color: ${({ theme }) => theme.colors.text};
  }
  
  span {
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.colors.textAlt};
  }
`;

const PlaceholderContent = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['8']};
  color: ${({ theme }) => theme.colors.textAlt};
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['8']};
  color: ${({ theme }) => theme.colors.error};
  
  h3 {
    margin-bottom: ${({ theme }) => theme.spacing['2']};
  }
`;

interface VirtualEventListProps {
  items: (EventOutputDTO | ReturnType<typeof useEventGrouping>[0])[];
  isFetching: boolean;
  hasNextPage?: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}

const VirtualEventList: FC<VirtualEventListProps> = ({ 
  items, 
  isFetching, 
  hasNextPage, 
  fetchNextPage, 
  isFetchingNextPage 
}) => {
  if (!items || items.length === 0) {
    return (
      <PlaceholderContent>
        <h3>No events found</h3>
        <p>Try adjusting your filters or check back later for new events.</p>
      </PlaceholderContent>
    );
  }
  const listRef = useRef<VariableSizeList>(null);
  const rowHeights = useRef<Record<number, number>>({});
  
  const getItemSize = useCallback((index: number) => {
    return rowHeights.current[index] || 200; // Default height estimate
  }, []);
  
  const setItemSize = useCallback((index: number, size: number) => {
    rowHeights.current[index] = size;
    if (listRef.current) {
      listRef.current.resetAfterIndex(index);
    }
  }, []);
  
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    const rowRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
      if (rowRef.current) {
        const height = rowRef.current.getBoundingClientRect().height;
        if (height !== rowHeights.current[index]) {
          setItemSize(index, height);
        }
      }
    }, [index, item]);
    
    // Handle infinite scroll
    useEffect(() => {
      if (index === items.length - 5 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, [index]);
    
    if (!item) {
      return (
        <div style={style} ref={rowRef}>
          <Skeleton variant="rectangular" width="100%" height="100px" />
        </div>
      );
    }
    
    return (
      <div style={style} ref={rowRef}>
        <EventFeed>
          {isEventGroup(item) ? (
            <EventGroup>
              <GroupHeader>
                <h4>{item.playerName} - {item.events.length} events</h4>
                <span>
                  {item.startTime.toLocaleTimeString()} - {item.endTime.toLocaleTimeString()}
                </span>
              </GroupHeader>
              {item.events.map((event) => (
                <EventItem key={event.id} event={event} onDetailClick={() => {}} />
              ))}
            </EventGroup>
          ) : (
            <EventItem event={item} onDetailClick={() => {}} />
          )}
        </EventFeed>
      </div>
    );
  }, [items, hasNextPage, isFetchingNextPage, fetchNextPage, setItemSize]);
  
  const InnerElementType = forwardRef<HTMLDivElement, any>(function InnerTimeline({ style, ...rest }, ref) {
    return (
      <div
        ref={ref}
        style={{
          ...style,
          paddingBottom: isFetching ? '50px' : '0',
        }}
        {...rest}
      />
    );
  });
  
  return (
    <Autosizer>
      {({ width, height }: { width: number | undefined; height: number | undefined }) => {
        if (width === undefined || height === undefined) {
          return <div>Loading...</div>;
        }
        return (
          <VariableSizeList
            ref={listRef}
            itemCount={items.length}
            itemSize={getItemSize}
            width={width}
            height={height}
            innerElementType={InnerElementType}
          >
            {Row}
          </VariableSizeList>
        );
      }}
    </Autosizer>
  );
};

function Component() {
  useDocumentTitle('Events');
  const loaderData = Route.useLoaderData();
  const navigate = useNavigate({ from: Route.fullPath });
  const search = Route.useSearch();
  const [filterPreferences, setFilterPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('events-filter-preferences');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const {
    data: rawEvents,
    refetch,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    error,
    isError,
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
      greaterThan: { createdAt: search.dateRange?.start },
      lessThan: { createdAt: search.dateRange?.end },
      extend: ['gameServer', 'module', 'player', 'user'],
    }),
    initialData: loaderData,
  });

  const [enableGrouping, setEnableGrouping] = useState(true);
  
  const events = useMemo(() => {
    return rawEvents.pages.flatMap((page) => page.data);
  }, [rawEvents]);
  
  const groupedEvents = useEventGrouping(events, enableGrouping ? 30000 : 0);

  const onFilterChangeSubmit = (filter: EventFilterInputs) => {
    // Save preferences
    const preferences = {
      enableGrouping,
      ...filter,
    };
    localStorage.setItem('events-filter-preferences', JSON.stringify(preferences));
    setFilterPreferences(preferences);
    
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
    <PageContainer>
      <Header>
        <QuickFilters>
          <Button
            size="small"
            color="secondary"
            onClick={() => onFilterChangeSubmit({
              playerIds: [],
              gameServerIds: [],
              eventNames: [],
              moduleIds: [],
              dateRange: { start: new Date(Date.now() - 3600000).toISOString(), end: new Date().toISOString() }
            })}
          >
            Last Hour
          </Button>
          <Button
            size="small"
            color="secondary"
            onClick={() => onFilterChangeSubmit({
              playerIds: [],
              gameServerIds: [],
              eventNames: [],
              moduleIds: [],
              dateRange: { start: new Date(Date.now() - 86400000).toISOString(), end: new Date().toISOString() }
            })}
          >
            Last 24h
          </Button>
          <Button
            size="small"
            color="secondary"
            onClick={() => onFilterChangeSubmit({
              playerIds: [],
              gameServerIds: [],
              eventNames: [],
              moduleIds: [],
              dateRange: { start: new Date(Date.now() - 604800000).toISOString(), end: new Date().toISOString() }
            })}
          >
            Last Week
          </Button>
        </QuickFilters>
        
        {(search.playerIds?.length > 0 || search.gameServerIds?.length > 0 || 
          search.eventNames?.length > 0 || search.moduleIds?.length > 0 || search.dateRange) && (
          <ActiveFilters>
            {search.playerIds?.map((id) => (
              <Chip
                key={`player-${id}`}
                label={`Player: ${id}`}
                color="primary"
                onDelete={() => onFilterChangeSubmit({
                  ...search,
                  playerIds: search.playerIds.filter(p => p !== id)
                })}
              />
            ))}
            {search.gameServerIds?.map((id) => (
              <Chip
                key={`server-${id}`}
                label={`Server: ${id}`}
                color="primary"
                onDelete={() => onFilterChangeSubmit({
                  ...search,
                  gameServerIds: search.gameServerIds.filter(g => g !== id)
                })}
              />
            ))}
            {search.eventNames?.map((name) => (
              <Chip
                key={`event-${name}`}
                label={`Event: ${name}`}
                color="primary"
                onDelete={() => onFilterChangeSubmit({
                  ...search,
                  eventNames: search.eventNames.filter(e => e !== name)
                })}
              />
            ))}
            {search.dateRange && (
              <Chip
                label="Date Range"
                color="primary"
                onDelete={() => onFilterChangeSubmit({
                  ...search,
                  dateRange: undefined
                })}
              />
            )}
          </ActiveFilters>
        )}
        
        <FilterBar>
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
          />
          <Button
            isLoading={isFetching}
            disabled={isFetching}
            icon={<RefreshIcon />}
            onClick={() => refetch()}
            color="secondary"
          >
            Refresh
          </Button>
          <Button
            onClick={() => setEnableGrouping(!enableGrouping)}
            color={enableGrouping ? 'primary' : 'secondary'}
            variant="outline"
          >
            {enableGrouping ? 'Disable' : 'Enable'} Grouping
          </Button>
        </FilterBar>
      </Header>
      
      {isError && (
        <ErrorContainer>
          <h3>Error loading events</h3>
          <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
          {error instanceof Error && error.message.includes('rate limit') && (
            <p>You've exceeded the rate limit. Please wait a moment before trying again.</p>
          )}
          <Button onClick={() => refetch()} color="primary">
            Try Again
          </Button>
        </ErrorContainer>
      )}
      
      {!isError && (
      <TimelineContainer>
        <ScrollableContainer>
          <VirtualEventList
            items={groupedEvents}
            isFetching={isFetching}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        </ScrollableContainer>
      </TimelineContainer>
      )}
    </PageContainer>
  );
}
