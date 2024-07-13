import { createFileRoute, redirect } from '@tanstack/react-router';
import { useMemo } from 'react';
import { Stats, styled, LineChart, Card } from '@takaro/lib-components';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { eventsFailedFunctionsQueryOptions, eventsQueryOptions } from 'queries/event';
import { DateTime } from 'luxon';
import { useForm, useWatch } from 'react-hook-form';
import { TimePeriodSelect } from 'components/selects';
import { useQuery } from '@tanstack/react-query';
import { hasPermission } from 'hooks/useHasPermission';
import { PlayersOnlineStatsQueryOptions, ActivityStatsQueryOptions } from 'queries/stats';
import { EventFeed, EventItem } from 'components/events/EventFeed';

export const Route = createFileRoute('/_auth/_global/dashboard')({
  beforeLoad: async ({ context }) => {
    const session = await context.auth.getSession();
    if (!hasPermission(session, ['READ_EVENTS', 'READ_GAMESERVERS', 'READ_PLAYERS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData(PlayersOnlineStatsQueryOptions());
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
  const { data } = useQuery({ ...PlayersOnlineStatsQueryOptions(), initialData: loaderData });

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
    ActivityStatsQueryOptions({ timeType: 'daily', dataType: 'players', startDate, endDate: now })
  );

  const { data: cronjobsExecuted, isLoading: isLoadingCronJobsExecuted } = useQuery(
    eventsQueryOptions({
      search: { eventName: ['cronjob-executed'] },
      greaterThan: { createdAt: startDate },
      lessThan: { createdAt: now },
    })
  );

  const { data: commandsExecuted, isLoading: isLoadingCommandsExecuted } = useQuery(
    eventsQueryOptions({
      search: { eventName: ['command-executed'] },
      greaterThan: { createdAt: startDate },
      lessThan: { createdAt: now },
    })
  );

  const { data: HooksExecuted, isLoading: isLoadingHooksExecuted } = useQuery(
    eventsQueryOptions({
      search: { eventName: ['hook-executed'] },
      greaterThan: { createdAt: startDate },
      lessThan: { createdAt: now },
    })
  );

  const { data: failedFunctions } = useQuery(
    eventsFailedFunctionsQueryOptions({
      greaterThan: { createdAt: startDate },
      lessThan: { createdAt: now },
      limit: 10,
      extend: ['gameServer', 'module', 'player', 'user'],
      sortBy: 'createdAt',
      sortDirection: 'desc',
    })
  );

  return (
    <>
      <Container>
        <div style={{ width: '200px', marginLeft: 'auto' }}>
          <TimePeriodSelect control={control} name="period" />
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
            value={`${HooksExecuted?.meta.total} Hooks`}
          />
        </Stats>

        <div style={{ display: 'flex', flexFlow: 'flex-wrap', gap: '2rem', marginTop: '40px' }}>
          <Card style={{ height: '400px', width: '60%', position: 'relative' }} variant="outline">
            <h2>Players online</h2>
            <LineChart
              name="Players online"
              data={data.values}
              xAccessor={(d) => new Date(d[0] * 1000)}
              yAccessor={(d) => d[1]}
              curveType="curveBasis"
            />
          </Card>
          <Card style={{ height: '100%', width: '40%', position: 'relative' }}>
            <h2>Module errors</h2>
            <EventFeed>
              {failedFunctions?.data.flatMap((event) => (
                <EventItem key={event.id} event={event} onDetailClick={() => {}} />
              ))}
            </EventFeed>
          </Card>
        </div>
      </Container>
    </>
  );
}
