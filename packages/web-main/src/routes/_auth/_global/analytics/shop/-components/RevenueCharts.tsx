import { FC } from 'react';
import { styled, Card, EChartsHeatmap, Skeleton, IconTooltip, AreaChart } from '@takaro/lib-components';
import { RevenueMetricsDTO } from '@takaro/apiclient';
import { AiOutlineInfoCircle as InfoIcon } from 'react-icons/ai';

interface RevenueChartsProps {
  revenue: RevenueMetricsDTO;
  isLoading?: boolean;
}

const ChartsContainer = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[4]};
  grid-template-columns: 1fr;

  @media (min-width: 1200px) {
    grid-template-columns: 7fr 3fr;
  }
`;

const ChartCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing[4]};
  min-height: 400px;
  display: flex;
  flex-direction: column;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const ChartTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSize.large};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const ChartContent = styled.div`
  position: relative;
  height: 300px;
`;

const MetricInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  margin-top: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.fontSize.small};
`;

const MetricLabel = styled.span`
  color: ${({ theme }) => theme.colors.textAlt};
`;

const MetricValue = styled.span`
  font-weight: bold;
`;

export const RevenueCharts: FC<RevenueChartsProps> = ({ revenue, isLoading }) => {
  // Prepare data for AreaChart
  const chartData =
    revenue.timeSeries.map((point) => ({
      date: point.date,
      revenue: point.value,
      comparison: point.comparison || 0,
    })) || [];

  // Prepare data for HeatMap (7 days x 24 hours)
  const heatmapData =
    revenue?.heatmap?.map((p) => ({
      x: p.hour,
      y: p.day,
      value: p.value,
    })) || [];

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) =>
    i === 0 ? '12am' : i < 12 ? `${i}am` : i === 12 ? '12pm' : `${i - 12}pm`,
  );

  return (
    <ChartsContainer>
      <Card>
        <Card.Title label="Revenue Over time">
          <IconTooltip icon={<InfoIcon />} size="small" color="background">
            Shows daily revenue trends over time. The area under the line represents total revenue volume.
          </IconTooltip>
        </Card.Title>
        <ChartContent>
          {isLoading ? (
            <Skeleton variant="rectangular" width="100%" height="100%" />
          ) : chartData.length > 0 ? (
            <AreaChart
              data={chartData}
              xAccessor={(d) => new Date(d.date)}
              yAccessor={(d) => d.revenue}
              name="Revenue"
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <span style={{ color: '#9ca3af' }}>No revenue data available</span>
            </div>
          )}
        </ChartContent>
        <MetricInfo>
          <MetricRow>
            <MetricLabel>Growth Rate</MetricLabel>
            <MetricValue style={{ color: revenue?.growth && revenue.growth > 0 ? '#10b981' : '#ef4444' }}>
              {revenue?.growth ? `${revenue.growth > 0 ? '+' : ''}${revenue.growth.toFixed(1)}%` : '0%'}
            </MetricValue>
          </MetricRow>
        </MetricInfo>
      </Card>

      <ChartCard>
        <ChartHeader>
          <ChartTitle>
            Peak Sales Heatmap
            <IconTooltip icon={<InfoIcon />} size="small" color="background">
              Heat map showing sales activity by hour (horizontal) and day of week (vertical). Darker colors indicate
              higher sales volume. Helps identify peak shopping times and patterns in customer behavior.
            </IconTooltip>
          </ChartTitle>
        </ChartHeader>
        <ChartContent>
          {isLoading ? (
            <Skeleton variant="rectangular" width="100%" height="100%" />
          ) : heatmapData.length > 0 ? (
            <EChartsHeatmap
              data={heatmapData}
              xAccessor={(d: any) => d.x}
              yAccessor={(d: any) => d.y}
              valueAccessor={(d: any) => d.value}
              xCategories={hours}
              yCategories={days}
              showLabel={false}
              tooltipFormatter={(params: any) => {
                const hour = hours[params.value[0]];
                const day = days[params.value[1]];
                const value = params.value[2];
                return `${day} ${hour}<br/>Revenue: ${value.toLocaleString()}`;
              }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <span style={{ color: '#9ca3af' }}>No heatmap data available</span>
            </div>
          )}
        </ChartContent>
        <MetricInfo>
          <MetricRow>
            <MetricLabel>Peak Hour</MetricLabel>
            <MetricValue>{revenue?.peakHour || 'N/A'}</MetricValue>
          </MetricRow>
          <MetricRow>
            <MetricLabel>Peak Day</MetricLabel>
            <MetricValue>{revenue?.peakDay || 'N/A'}</MetricValue>
          </MetricRow>
        </MetricInfo>
      </ChartCard>
    </ChartsContainer>
  );
};
