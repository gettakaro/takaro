import { LineChart, Card, styled, Stats, QuestionTooltip, Skeleton } from '@takaro/lib-components';
import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { PlayersOnlineStatsQueryOptions, ActivityStatsQueryOptions } from 'queries/stats';
import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { TimePeriodSelect } from 'components/selects';
import { eventsQueryOptions } from 'queries/event';

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 150px;
  width: 100%;
  gap: ${({ theme }) => theme.spacing[2]};
  padding-bottom: ${({ theme }) => theme.spacing[4]};
`;

export function PlayerStats() {
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

  const { data: dailyActiveUsers } = useQuery(
    ActivityStatsQueryOptions({ timeType: 'daily', dataType: 'players', startDate, endDate: now }),
  );

  const { data: newPlayersData, isLoading: isLoadingNewPlayerData } = useQuery(
    eventsQueryOptions({
      filters: { eventName: ['player-created'], gameserverId: ['null'] },
      greaterThan: { createdAt: startDate },
      lessThan: { createdAt: now },
    }),
  );

  const { data: playersOnlineData } = useQuery(PlayersOnlineStatsQueryOptions(undefined, startDate, now));

  if (!dailyActiveUsers || !newPlayersData || !playersOnlineData) {
    return (
      <Container>
        <Skeleton variant="rectangular" width="100%" height="300px" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <Skeleton width="100%" variant="rectangular" height="140px" />
          <Skeleton width="100%" variant="rectangular" height="140px" />
        </div>
      </Container>
    );
  }

  return (
    <>
      <div style={{ width: '200px', marginLeft: 'auto' }}>
        <TimePeriodSelect control={control} name="period" />
      </div>
      <Container>
        <Card variant="outline">
          <Card.Title label="Daily active players">
            <QuestionTooltip>How many players were active on the server each day.</QuestionTooltip>
          </Card.Title>
          <Card.Body>
            <div style={{ height: '200px' }}>
              <LineChart
                name="Daily active players"
                data={dailyActiveUsers.values}
                xAccessor={(d) => new Date(d[0] * 1000)}
                yAccessor={(d) => d[1]}
                curveType="curveBasis"
              />
            </div>
          </Card.Body>
        </Card>

        <Stats border={false} direction="vertical">
          <Stats.Stat
            isLoading={isLoadingNewPlayerData}
            description="New players"
            value={newPlayersData.meta.total?.toString() ?? '0'}
          />
          <Stats.Stat
            isLoading={isLoadingNewPlayerData}
            description="Peak online players"
            value={playersOnlineData.values.reduce((acc, cur) => Math.max(acc, cur[1]), 0).toString()}
          />
        </Stats>
      </Container>
    </>
  );
}
