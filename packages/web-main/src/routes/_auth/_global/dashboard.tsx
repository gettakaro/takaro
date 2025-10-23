import { createFileRoute, redirect } from '@tanstack/react-router';
import { useMemo } from 'react';
import { Stats, styled, LineChart, Card, GeoMercator, IconTooltip, Chip } from '@takaro/lib-components';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { eventsFailedFunctionsQueryOptions, eventsQueryOptions } from '../../../queries/event';
import { DateTime } from 'luxon';
import { useForm, useWatch } from 'react-hook-form';
import { TimePeriodSelectField } from '../../../components/selects';
import { useQuery } from '@tanstack/react-query';
import { hasPermission } from '../../../hooks/useHasPermission';
import {
  PlayersOnlineStatsQueryOptions,
  ActivityStatsQueryOptions,
  CountriesStatsQueryOptions,
} from '../../../queries/stats';
import { EventFeed, EventItem } from '../../../components/events/EventFeed';
import { PERMISSIONS } from '@takaro/apiclient';
import { userMeQueryOptions } from '../../../queries/user';
import { AiOutlineQuestion as QuestionIcon } from 'react-icons/ai';

export const Route = createFileRoute('/_auth/_global/dashboard')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, [PERMISSIONS.ReadEvents, PERMISSIONS.ManageGameservers, PERMISSIONS.ReadPlayers])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ context }) => {
    const [playerOnlineStats, countriesStats] = await Promise.all([
      context.queryClient.ensureQueryData(PlayersOnlineStatsQueryOptions()),
      context.queryClient.ensureQueryData(CountriesStatsQueryOptions({ gameServerIds: [] })),
    ]);
    return { playerOnlineStats, countriesStats };
  },
  component: Component,
});

const Container = styled.div`
  h1 {
    font-size: ${({ theme }) => theme.fontSize.huge};
    margin-bottom: ${({ theme }) => theme.spacing[5]};
  }
`;

function Component() {
  useDocumentTitle('Dashboard');
  const loaderData = Route.useLoaderData();
  const { data: playerOnlineStatsData, isPending: isPendingPlayerOnlineStats } = useQuery({
    ...PlayersOnlineStatsQueryOptions(),
    initialData: loaderData.playerOnlineStats,
  });
  const { data: countriesStatsData, isPending: isPendingCountriesStats } = useQuery({
    ...CountriesStatsQueryOptions({ gameServerIds: [] }),
    initialData: loaderData.countriesStats,
  });

  const { control } = useForm({
    defaultValues: {
      period: 'last24Hours',
    },
  });
  const selectedPeriod = useWatch({ control, name: 'period' });
  const { startDate, now } = useMemo(() => {
    let startDate: string | null;

    switch (selectedPeriod) {
      case 'last24Hours':
        startDate = DateTime.now().minus({ days: 1 }).toISO();
        break;
      case 'last7Days':
        startDate = DateTime.now().minus({ days: 7 }).toISO();
        break;
      case 'last30Days':
        startDate = DateTime.now().minus({ days: 30 }).toISO();
        break;
      case 'last90Days':
        startDate = DateTime.now().minus({ days: 90 }).toISO();
        break;
      default:
        startDate = null;
    }

    if (startDate === null) {
      throw new Error('startDate is undefined or null');
    }

    const now = DateTime.now().toISO();

    if (now === null) {
      throw new Error('Could not get current time');
    }

    return { startDate, now };
  }, [selectedPeriod]);

  const { data: dailyActiveUsers, isLoading: isLoadingDailyActiveUsers } = useQuery(
    ActivityStatsQueryOptions({ timeType: 'daily', dataType: 'players', startDate, endDate: now }),
  );

  const { data: cronjobsExecuted, isLoading: isLoadingCronJobsExecuted } = useQuery(
    eventsQueryOptions({
      search: { eventName: ['cronjob-executed'] },
      greaterThan: { createdAt: startDate },
      lessThan: { createdAt: now },
    }),
  );

  const { data: commandsExecuted, isLoading: isLoadingCommandsExecuted } = useQuery(
    eventsQueryOptions({
      search: { eventName: ['command-executed'] },
      greaterThan: { createdAt: startDate },
      lessThan: { createdAt: now },
    }),
  );

  const { data: hooksExecuted, isLoading: isLoadingHooksExecuted } = useQuery(
    eventsQueryOptions({
      search: { eventName: ['hook-executed'] },
      greaterThan: { createdAt: startDate },
      lessThan: { createdAt: now },
    }),
  );

  const { data: failedFunctions } = useQuery(
    eventsFailedFunctionsQueryOptions({
      greaterThan: { createdAt: startDate },
      lessThan: { createdAt: now },
      limit: 10,
      extend: ['gameServer', 'module', 'player', 'user'],
      sortBy: 'createdAt',
      sortDirection: 'desc',
    }),
  );

  return (
    <>
      <Container>
        <div style={{ width: '200px', marginLeft: 'auto' }}>
          <TimePeriodSelectField control={control} name="period" />
        </div>
        <Stats border={false} direction="horizontal">
          <Stats.Stat
            isLoading={isLoadingDailyActiveUsers}
            description="Daily active players"
            value={
              dailyActiveUsers && dailyActiveUsers.values && dailyActiveUsers.values.length > 0
                ? `${dailyActiveUsers.values[dailyActiveUsers?.values.length - 1][1]} players`
                : 'No data available'
            }
          />
          <Stats.Stat
            isLoading={isLoadingCronJobsExecuted}
            description="Executed"
            value={`${cronjobsExecuted?.meta.total} Cronjobs`}
          />
          <Stats.Stat
            isLoading={isLoadingCommandsExecuted}
            description="Executed"
            value={`${commandsExecuted?.meta.total} Commands`}
          />
          <Stats.Stat
            isLoading={isLoadingHooksExecuted}
            description="Executed"
            value={`${hooksExecuted?.meta.total} Hooks`}
          />
        </Stats>

        <div
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '2rem',
            marginTop: '40px',
            gridTemplateRows: 'auto',
          }}
        >
          <Card variant="outline">
            <Card.Title label="Players online" />
            <Card.Body>
              <div style={{ height: '400px', width: '100%', position: 'relative' }}>
                {!isPendingPlayerOnlineStats && (
                  <LineChart
                    name="Players online"
                    data={playerOnlineStatsData.values}
                    xAccessor={(d) => new Date(d[0] * 1000)}
                    yAccessor={(d) => d[1]}
                    curveType="curveBasis"
                  />
                )}
              </div>
            </Card.Body>
          </Card>
          <Card>
            <Card.Title label="Module errors" />
            <Card.Body>
              <div style={{ height: '400px', width: '100%', position: 'relative', overflow: 'auto' }}>
                <EventFeed>
                  {failedFunctions?.data.flatMap((event) => (
                    <EventItem key={event.id} event={event} onDetailClick={() => {}} />
                  ))}
                </EventFeed>
              </div>
            </Card.Body>
          </Card>
        </div>

        <Card variant="outline" style={{ marginTop: '2rem' }}>
          <Card.Title label="Global Player Map">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Chip variant="outline" color="warning" label="Beta" />
              <IconTooltip color="background" icon={<QuestionIcon />}>
                Shows where your players are from
              </IconTooltip>
            </div>
          </Card.Title>
          <Card.Body>
            <div style={{ height: '600px', width: '100%', position: 'relative' }}>
              {!isPendingCountriesStats && (
                <GeoMercator
                  name="Countries"
                  data={countriesStatsData}
                  xAccessor={(d) => d.country}
                  yAccessor={(d) => parseInt(d.playerCount, 10)}
                  tooltipAccessor={(d) => `${d.country}:${d.playerCount}`}
                  allowZoomAndDrag={false}
                  showZoomControls={false}
                  showCountrySidebar={true}
                />
              )}
            </div>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}
