import { FC, useState } from 'react';
import { styled, Card, AreaChart, HeatMap, Skeleton, ToggleButtonGroup } from '@takaro/lib-components';
import { RevenueMetricsDTO } from '@takaro/apiclient';
import { DateTime } from 'luxon';

interface RevenueChartsProps {
  revenue?: RevenueMetricsDTO;
  isLoading?: boolean;
}

const ChartsContainer = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[4]};
  grid-template-columns: 1fr;
  
  @media (min-width: 1200px) {
    grid-template-columns: 70% 30%;
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
`;

const ChartContent = styled.div`
  flex: 1;
  position: relative;
  min-height: 300px;
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
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  if (isLoading) {
    return (
      <ChartsContainer>
        <Skeleton variant="rectangular" height="400px" />
        <Skeleton variant="rectangular" height="400px" />
      </ChartsContainer>
    );
  }
  
  // Prepare data for AreaChart
  const chartData = revenue?.timeSeries?.map(point => ({
    date: DateTime.fromISO(point.date).toFormat('MMM dd'),
    revenue: point.value,
    comparison: point.comparison || 0,
  })) || [];
  
  // Prepare data for HeatMap (7 days x 24 hours)
  const heatmapData = Array.from({ length: 7 }, (_, dayIndex) => 
    Array.from({ length: 24 }, (_, hourIndex) => {
      const dataPoint = revenue?.heatmap?.find(
        p => p.day === dayIndex && p.hour === hourIndex
      );
      return dataPoint?.value || 0;
    })
  );
  
  const _days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const _hours = Array.from({ length: 24 }, (_, i) => 
    i === 0 ? '12am' : i < 12 ? `${i}am` : i === 12 ? '12pm' : `${i - 12}pm`
  );
  
  return (
    <ChartsContainer>
      <ChartCard>
        <ChartHeader>
          <ChartTitle>Revenue Over Time</ChartTitle>
          <ToggleButtonGroup 
            exclusive
            defaultValue={timePeriod}
            onChange={(value) => setTimePeriod(value as 'daily' | 'weekly' | 'monthly')}
          >
            <ToggleButtonGroup.Button value="daily">
              Daily
            </ToggleButtonGroup.Button>
            <ToggleButtonGroup.Button value="weekly">
              Weekly
            </ToggleButtonGroup.Button>
            <ToggleButtonGroup.Button value="monthly">
              Monthly
            </ToggleButtonGroup.Button>
          </ToggleButtonGroup>
        </ChartHeader>
        <ChartContent>
          {chartData.length > 0 ? (
            <AreaChart
              name="Revenue"
              data={chartData}
              xAccessor={(d: any) => new Date(d.date)}
              yAccessor={(d: any) => d.revenue}
              tooltipAccessor={(d: any) => `$${d.revenue.toFixed(0)}`}
              showGrid
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
      </ChartCard>
      
      <ChartCard>
        <ChartHeader>
          <ChartTitle>Revenue Heatmap</ChartTitle>
        </ChartHeader>
        <ChartContent>
          {heatmapData.some(row => row.some(val => val > 0)) ? (
            <HeatMap
              name="Revenue Heatmap"
              data={heatmapData.flat().map((value, index) => ({
                x: index % 24,
                y: Math.floor(index / 24),
                z: value
              }))}
              xAccessor={(d: any) => d.x}
              yAccessor={(d: any) => d.y}
              zAccessor={(d: any) => d.z}
              tooltipAccessor={(d: any) => `$${d.z}`}
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