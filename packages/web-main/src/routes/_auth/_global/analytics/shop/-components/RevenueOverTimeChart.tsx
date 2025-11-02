import { RevenueMetricsDTO, TimeSeriesDataPointDTO } from '@takaro/apiclient';
import { AreaChart, Card, IconTooltip, Stats } from '@takaro/lib-components';
import { FC } from 'react';

import { AiOutlineInfoCircle as InfoIcon, AiOutlineRise as GrowthRateIcon } from 'react-icons/ai';

interface RevenueOverTimeChartProps {
  revenue: RevenueMetricsDTO;
}

export const RevenueOverTimeChart: FC<RevenueOverTimeChartProps> = ({ revenue }) => {
  return (
    <Card>
      <Card.Title label="Revenue Over time">
        <IconTooltip icon={<InfoIcon />} size="small" color="white">
          Shows daily revenue trends over time. The area under the line represents total revenue volume.
        </IconTooltip>
      </Card.Title>
      <Card.Body>
        <div style={{ position: 'relative', height: '300px' }}>
          <AreaChart<TimeSeriesDataPointDTO>
            data={revenue.timeSeries}
            xAccessor={(d) => new Date(d.date)}
            yAccessor={(d) => d.value}
            name="Revenue"
          />
        </div>
        <Stats grouped={false} size="small">
          <Stats.Stat
            description="Growth rate"
            value={`${revenue.growth.toFixed(1)}%`}
            size="tiny"
            icon={<GrowthRateIcon />}
          />
        </Stats>
      </Card.Body>
    </Card>
  );
};
