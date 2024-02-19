import { createFileRoute, redirect } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { Button, Stats, styled } from '@takaro/lib-components';
import { useSocket } from 'hooks/useSocket';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { eventsOptions } from 'queries/events';
import { DateTime } from 'luxon';
import { useForm, useWatch } from 'react-hook-form';
import { TimePeriodSelect } from 'components/selects';
import { useQuery } from '@tanstack/react-query';
import { hasPermission } from 'hooks/useHasPermission';

export const Route = createFileRoute('/_auth/_global/dashboard')({
  beforeLoad: async ({ context }) => {
    if (!hasPermission(context.auth.session, ['READ_EVENTS'])) {
      throw redirect({ to: '/forbidden' });
    }
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

  const { socket, isConnected } = useSocket();
  const [lastPong, setLastPong] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<string | null>(null);

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

  // players online last 24 hours
  // We have total records in metadata
  const { data: playersConnected, isLoading: isLoadingPlayerConnected } = useQuery(
    eventsOptions({
      search: { eventName: ['player-connected'] },
      startDate,
      endDate: now,
    })
  );

  const { data: cronjobsExecuted, isLoading: isLoadingCronJobsExecuted } = useQuery(
    eventsOptions({
      search: { eventName: ['cronjob-executed'] },
      startDate,
      endDate: now,
    })
  );

  const { data: commandsExecuted, isLoading: isLoadingCommandsExecuted } = useQuery(
    eventsOptions({
      search: { eventName: ['command-executed'] },
      startDate,
      endDate: now,
    })
  );

  const { data: HooksExecuted, isLoading: isLoadingHooksExecuted } = useQuery(
    eventsOptions({
      search: { eventName: ['hook-executed'] },
      startDate,
      endDate: now,
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
            isLoading={isLoadingPlayerConnected}
            description="Players connected"
            value={`${playersConnected?.meta.total} players`}
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

        {/* Manual increase of spacing */}
        <Flex style={{ marginTop: '30px' }}>
          <span>
            <p>Connected: {'' + isConnected}</p>
            <p>Last pong: {lastPong || '-'}</p>
            <p>Last event: {lastEvent || '-'}</p>
          </span>
          <Button text={'Send ping'} onClick={sendPing} />
        </Flex>
      </Container>
    </>
  );
}
