import { createFileRoute, redirect } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { Button, Stats, styled, LineChart, Card } from '@takaro/lib-components';
import { useSocket } from 'hooks/useSocket';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { eventsQueryOptions } from 'queries/event';
import { DateTime } from 'luxon';
import { useForm, useWatch } from 'react-hook-form';
import { TimePeriodSelect } from 'components/selects';
import { useQuery } from '@tanstack/react-query';
import { hasPermission } from 'hooks/useHasPermission';
import { PlayersOnlineStatsQueryOptions, ActivityStatsQueryOptions } from 'queries/stats';

export const Route = createFileRoute('/_auth/_global/dashboard')({
  beforeLoad: async ({ context }) => {
    if (!hasPermission(context.auth.session, ['READ_EVENTS'])) {
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

const Flex = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[4]};
`;

function Component() {
  useDocumentTitle('Dashboard');

  const loaderData = Route.useLoaderData();

  const { socket, isConnected } = useSocket();
  const [lastPong, setLastPong] = useState<string>('-');
  const [lastEvent, setLastEvent] = useState<string>('-');

  const { data } = useQuery({ ...PlayersOnlineStatsQueryOptions(), initialData: loaderData });

  const { data: dailyActiveUsers, isLoading: isLoadingDau } = useQuery({
    ...ActivityStatsQueryOptions({ timeType: 'daily', dataType: 'players' }),
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

  const sendPing = () => {
    socket.emit('ping');
  };

  useEffect(() => {
    socket.emit('ping');
  }, [socket, isConnected]);

  useEffect(() => {
    socket.on('pong', () => {
      setLastPong(new Date().toISOString());
    });

    socket.on('gameEvent', (gameserverId, type, data) => {
      setLastEvent(`${gameserverId} - ${type} - ${JSON.stringify(data)}`);
    });

    return () => {
      socket.off('pong');
    };
  });

  return (
    <>
      <Container>
        <div style={{ width: '200px', marginLeft: 'auto' }}>
          <TimePeriodSelect control={control} name="period" />
        </div>
        <Stats border={false} direction="horizontal">
          <Stats.Stat
            isLoading={isLoadingDau}
            description="Daily active players"
            value={`${dailyActiveUsers?.values[dailyActiveUsers?.values.length - 1][1]} players`}
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
          <Card style={{ height: '400px', width: '800px', position: 'relative' }} variant="outline">
            <h2>Players online</h2>
            <LineChart
              name="Players online"
              data={data.values}
              xAccessor={(d) => new Date(d[0] * 1000)}
              yAccessor={(d) => d[1]}
              curveType="curveBasis"
            />
          </Card>

          <Card>
            <Flex>
              <span>
                <p>Connected: {'' + isConnected}</p>
                <p>Last pong: {lastPong || '-'}</p>
                <p>Last event: {lastEvent || '-'}</p>
              </span>
              <Button text={'Send ping'} onClick={sendPing} />
            </Flex>
          </Card>
        </div>
      </Container>
    </>
  );
}
