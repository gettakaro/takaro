import { Button, styled, InfiniteScroll, Dialog } from '@takaro/lib-components';
import { EventFeed, EventItem } from '../../../components/events/EventFeed';
import { Settings } from 'luxon';
import { eventsInfiniteQueryOptions, useEventSubscription, exportEventsToCsv } from '../../../queries/event';
import {
  HiStop as PauseIcon,
  HiPlay as PlayIcon,
  HiArrowPath as RefreshIcon,
  HiArrowDownTray as DownloadIcon,
} from 'react-icons/hi2';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { hasPermission } from '../../../hooks/useHasPermission';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useMemo, useState } from 'react';
import { EventFilter, EventFilterInputs } from '../../../components/events/EventFilter';
import { eventFilterSchema } from '../../../components/events/eventFilterSchema';
import { PERMISSIONS, EventSearchInputDTO } from '@takaro/apiclient';
import { zodValidator } from '@tanstack/zod-adapter';
import { userMeQueryOptions } from '../../../queries/user';
import { useSnackbar } from 'notistack';

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
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showExportDialog, setShowExportDialog] = useState<boolean>(false);
  const [exportDialogData, setExportDialogData] = useState<{
    eventCount: number;
    estimatedSizeMB: number;
    estimatedTimeMinutes: number;
  } | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  // Stable timestamp for pagination - set on page load or when date range changes
  const [stableLessThan, setStableLessThan] = useState<string | undefined>(
    () => search.dateRange?.end || new Date().toISOString(),
  );

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
      greaterThan: { createdAt: search.dateRange?.start },
      lessThan: { createdAt: stableLessThan },
      extend: ['gameServer', 'module', 'player', 'user'],
    }),
    initialData: loaderData,
  });

  const events = useMemo(() => {
    return rawEvents.pages.flatMap((page) => page.data);
  }, [rawEvents]);

  // Check if export should be disabled
  const isExportDisabled = useMemo(() => {
    // Disable if already exporting
    if (isExporting) return true;

    // Disable if no events are found
    if (events.length === 0 && !isFetching) return true;

    // Disable if date range exceeds 90 days
    if (search.dateRange?.start && search.dateRange?.end) {
      const start = new Date(search.dateRange.start);
      const end = new Date(search.dateRange.end);
      const diffInMs = end.getTime() - start.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
      if (diffInDays > 90) return true;
    }

    return false;
  }, [isExporting, events.length, isFetching, search.dateRange]);

  const onFilterChangeSubmit = (filter: EventFilterInputs) => {
    // Update stable timestamp if date range changes
    if (filter.dateRange?.end !== search.dateRange?.end) {
      setStableLessThan(filter.dateRange?.end || new Date().toISOString());
    }

    navigate({
      search: {
        gameServerIds: filter.gameServerIds.length > 0 ? filter.gameServerIds : [],
        playerIds: filter.playerIds.length > 0 ? filter.playerIds : [],
        eventNames: filter.eventNames.length > 0 ? filter.eventNames : [],
        moduleIds: filter.moduleIds.length > 0 ? filter.moduleIds : [],
        dateRange: filter.dateRange,
      },
    });
  };

  const performExport = async () => {
    setIsExporting(true);

    // Build the query parameters matching the current filters
    const queryParams: EventSearchInputDTO = {
      filters: {
        playerId: search.playerIds.length > 0 ? search.playerIds : undefined,
        gameserverId: search.gameServerIds.length > 0 ? search.gameServerIds : undefined,
        eventName: search.eventNames.length > 0 ? search.eventNames : undefined,
        moduleId: search.moduleIds.length > 0 ? search.moduleIds : undefined,
      },
      greaterThan: search.dateRange?.start ? { createdAt: search.dateRange.start } : undefined,
      lessThan: search.dateRange?.end ? { createdAt: search.dateRange.end } : undefined,
      extend: ['gameServer', 'module', 'player', 'user'],
    };

    // Trigger the download
    await exportEventsToCsv(queryParams);

    // Reset loading state after a short delay (browser handles the actual download)
    setTimeout(() => {
      setIsExporting(false);
      enqueueSnackbar('Export started - check your downloads', { variant: 'default', type: 'info' });
    }, 1000);
  };

  const handleExport = async () => {
    // Get event count from the current search results
    const eventCount = rawEvents?.pages?.[0]?.meta?.total || 0;

    if (eventCount > 100000) {
      // Show warning dialog for large exports
      const estimatedSizeMB = Math.round(eventCount * 0.001); // Rough estimate: ~1KB per event
      const estimatedTimeMinutes = Math.ceil(eventCount / 50000); // Rough estimate: ~50k events per minute

      setExportDialogData({ eventCount, estimatedSizeMB, estimatedTimeMinutes });
      setShowExportDialog(true);
    } else {
      // For small exports, proceed directly
      await performExport();
    }
  };

  const handleConfirmExport = async () => {
    setShowExportDialog(false);
    await performExport();
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
            icon={live ? <PauseIcon /> : <PlayIcon />}
            onClick={() => setLive(!live)}
            color={live ? 'primary' : 'secondary'}
          >
            {live ? 'Pause event feed' : 'Show live event feed'}
          </Button>
          <Button
            isLoading={isFetching}
            disabled={live || isFetching}
            icon={<RefreshIcon />}
            onClick={() => refetch()}
            color={'secondary'}
          >
            Refresh feed
          </Button>
          <Button
            icon={<DownloadIcon />}
            onClick={handleExport}
            isLoading={isExporting}
            disabled={isExportDisabled}
            color={'secondary'}
          >
            {isExporting ? 'Generating export...' : 'Export to CSV'}
          </Button>
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

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <Dialog.Content>
          <Dialog.Heading>Confirm Large Export</Dialog.Heading>
          <Dialog.Body>
            {exportDialogData && (
              <>
                <p>This export contains approximately {exportDialogData.eventCount.toLocaleString()} events.</p>
                <ul style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
                  <li>
                    <strong>Estimated file size:</strong> ~{exportDialogData.estimatedSizeMB} MB
                  </li>
                  <li>
                    <strong>Estimated processing time:</strong> ~{exportDialogData.estimatedTimeMinutes} minute
                    {exportDialogData.estimatedTimeMinutes > 1 ? 's' : ''}
                  </li>
                </ul>
                <p style={{ marginBottom: '1.5rem' }}>
                  Large exports may take significant time and bandwidth. Do you want to continue?
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <Button variant="outline" onClick={() => setShowExportDialog(false)} disabled={isExporting}>
                    Cancel
                  </Button>
                  <Button color="primary" onClick={handleConfirmExport} isLoading={isExporting}>
                    Continue Export
                  </Button>
                </div>
              </>
            )}
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </>
  );
}
