import {
  LineChart,
  Card,
  styled,
  Loading,
  IconTooltip,
  GeoMercator,
  AreaChart,
  CountryList,
} from '@takaro/lib-components';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { DateTime } from 'luxon';
import {
  PlayersOnlineStatsQueryOptions,
  LatencyStatsQueryOptions,
  CountriesStatsQueryOptions,
  CurrencyStatsQueryOptions,
} from '../../../queries/stats';
import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { TimePeriodSelectField } from '../../../components/selects';
import { AiOutlineQuestion as QuestionIcon } from 'react-icons/ai';

const Container = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  align-items: stretch;
  flex-wrap: wrap;
  height: 100%;
  width: 100%;
  gap: ${({ theme }) => theme.spacing[2]};
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

  const { data: currencyInRotationData } = useQuery(CurrencyStatsQueryOptions(gameServerId));
  const { data: countryStats } = useQuery(CountriesStatsQueryOptions({ gameServerIds: [gameServerId] }));
  const { data: playersOnlineData } = useQuery(PlayersOnlineStatsQueryOptions(gameServerId, startDate, now));
  const { data: latencyData } = useQuery(LatencyStatsQueryOptions(gameServerId, startDate, now));
  // const { data: chatMessagesData } = useQuery(
  //   EventsCountQueryOptions({
  //     gameServerId,
  //     sumBy: ['gameserver'],
  //     startDate,
  //     endDate: now,
  //     eventName: EventsCountInputDTOEventNameEnum.ChatMessage,
  //     bucketStep: '1h',
  //   }),
  // );

  if (!playersOnlineData || !latencyData || !countryStats || !currencyInRotationData) {
    return <Loading />;
  }
  return (
    <>
      <div style={{ width: '200px', marginLeft: 'auto' }}>
        <TimePeriodSelectField control={control} name="period" />
      </div>
      <Container>
        <Card variant="outline">
          <Card.Title label="Latency">
            <IconTooltip color="background" icon={<QuestionIcon />}>
              Roundtrip time between Takaro and your server in ms
            </IconTooltip>
          </Card.Title>
          <div style={{ position: 'relative', height: '425px' }}>
            <LineChart
              name="Latency"
              data={latencyData.values}
              xAccessor={(d) => new Date(d[0] * 1000)}
              lines={[
                {
                  id: 'latency',
                  yAccessor: (d) => d[1],
                  tooltipAccessor: (d) => `${d[1]} ms`,
                },
              ]}
              axis={{
                numTicksY: 3,
              }}
              curveType="curveStep"
            />
          </div>
        </Card>

        <Card variant="outline">
          <Card.Title label="Players online">
            <IconTooltip color="background" icon={<QuestionIcon />}>
              Number of players online on the server
            </IconTooltip>
          </Card.Title>
          <div style={{ position: 'relative', height: '425px' }}>
            <LineChart
              name="Players online"
              data={playersOnlineData.values}
              xAccessor={(d) => new Date(d[0] * 1000)}
              lines={[
                {
                  id: 'Players online',
                  yAccessor: (d) => d[1],
                },
              ]}
              curveType="curveStep"
            />
          </div>
        </Card>

        {/*
        <StatCard variant="outline">
          <StatCard.Title label="Chat Messages">
            <QuestionTooltip>How many chat messages were sent per hour</QuestionTooltip>
          </StatCard.Title>
          <LineChart
            name="Chat Messages"
            data={chatMessagesData.values}
            xAccessor={(d) => new Date(d[0] * 1000)}
            yAccessor={(d) => d[1]}
            curveType="curveStep"
          />
        </StatCard>
        */}
        <Card variant="outline">
          <Card.Title label="Player Demographics">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <IconTooltip color="background" icon={<QuestionIcon />}>
                Shows where your players are from
              </IconTooltip>
            </div>
          </Card.Title>
          <div style={{ width: '100%', height: '700px', display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <GeoMercator
                name="Player countries"
                xAccessor={(d) => d.country}
                yAccessor={(d) => parseInt(d.playerCount)}
                tooltipAccessor={(d) => `${d.country}:${d.playerCount}`}
                data={countryStats}
                allowZoomAndDrag={false}
                showZoomControls={false}
              />
            </div>
            <CountryList data={countryStats} xAccessor={(d) => d.country} yAccessor={(d) => parseInt(d.playerCount)} />
          </div>
        </Card>

        <Card variant="outline">
          <Card.Title label="Currency in rotation"></Card.Title>
          <Card.Body>
            <div style={{ width: '100%', height: '500px' }}>
              <AreaChart
                name="currency rotation"
                data={currencyInRotationData.values}
                xAccessor={(d) => new Date(d[0] * 1000)}
                yAccessor={(d) => d[1]}
              />
            </div>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}
