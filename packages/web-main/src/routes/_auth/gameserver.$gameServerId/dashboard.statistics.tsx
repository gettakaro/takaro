import { LineChart, Card, styled, Loading } from '@takaro/lib-components';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { DateTime } from 'luxon';
import { PlayersOnlineStatsQueryOptions, LatencyStatsQueryOptions, EventsCountQueryOptions } from 'queries/stats';
import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { TimePeriodSelect } from 'components/selects';
import { EventsCountInputDTOEventNameEnum } from '@takaro/apiclient';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  height: 100%;
  width: 100%;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const StatCard = styled(Card)`
  height: 400px;
  width: 45%;
  padding-bottom: ${({ theme }) => theme.spacing[4]};
`;

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/dashboard/statistics')({
  component: Component,
});

function Component() {
  const { gameServerId } = Route.useParams();
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

  const { data: playersOnlineData } = useQuery(PlayersOnlineStatsQueryOptions(gameServerId, startDate, now));
  const { data: latencyData } = useQuery(LatencyStatsQueryOptions(gameServerId, startDate, now));
  const { data: chatMessagesData } = useQuery(
    EventsCountQueryOptions({
      gameServerId,
      sumBy: ['gameserver'],
      startDate,
      endDate: now,
      eventName: EventsCountInputDTOEventNameEnum.ChatMessage,
      bucketStep: '1h',
    }),
  );

  if (!playersOnlineData || !latencyData || !chatMessagesData) {
    // TODO: add better loading state, with each card separate?
    return <Loading />;
  }

  return (
    <>
      <div style={{ width: '200px', marginLeft: 'auto' }}>
        <TimePeriodSelect control={control} name="period" />
      </div>
      <Container>
        <StatCard variant="outline">
          <h2>Players online</h2>
          <small>Number of players online on the server</small>
          <LineChart
            name="Players online"
            data={playersOnlineData.values}
            xAccessor={(d) => new Date(d[0] * 1000)}
            yAccessor={(d) => d[1]}
            curveType="curveBasis"
          />
        </StatCard>

        <StatCard variant="outline">
          <h2>Latency</h2>
          <small>Roundtrip time between Takaro and your server in ms</small>
          <LineChart
            name="Latency"
            data={latencyData.values}
            xAccessor={(d) => new Date(d[0] * 1000)}
            yAccessor={(d) => d[1]}
            curveType="curveBasis"
          />
        </StatCard>

        <StatCard variant="outline">
          <h2>Chat Messages</h2>
          <small>How many chat messages were sent per hour</small>
          <LineChart
            name="Chat Messages"
            data={chatMessagesData.values}
            xAccessor={(d) => new Date(d[0] * 1000)}
            yAccessor={(d) => d[1]}
            curveType="curveBasis"
          />
        </StatCard>
      </Container>
    </>
  );
}
