import { RevenueMetricsDTO } from '@takaro/apiclient';
import { Card, HeatMap, IconTooltip, Stats } from '@takaro/lib-components';
import { FC } from 'react';

import { AiOutlineInfoCircle as InfoIcon } from 'react-icons/ai';

interface SalesActivityChartProps {
  revenue: RevenueMetricsDTO;
}

interface HeatmapDataPoint {
  hour: number;
  day: number;
  value: number;
}

export const SalesActivityChart: FC<SalesActivityChartProps> = ({ revenue }) => {
  const heatmapData: HeatmapDataPoint[] =
    revenue.heatmap.map((p) => ({
      hour: p.hour,
      day: p.day,
      value: p.value,
    })) || [];

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) =>
    i === 0 ? '12am' : i < 12 ? `${i}am` : i === 12 ? '12pm' : `${i - 12}pm`,
  );

  return (
    <Card>
      <Card.Title label="Peak Sales Heatmap">
        <IconTooltip icon={<InfoIcon />} size="small" color="white">
          Heat map showing sales activity by hour (horizontal) and day of week (vertical). Darker colors indicate higher
          sales volume. Helps identify peak shopping times and patterns in customer behavior.
        </IconTooltip>
      </Card.Title>
      <Card.Body>
        <div style={{ position: 'relative', height: '250px' }}>
          <HeatMap<HeatmapDataPoint>
            name="sales-activity"
            data={heatmapData}
            xAccessor={(d) => d.hour}
            yAccessor={(d) => d.day}
            valueAccessor={(d) => d.value}
            xCategories={hours}
            yCategories={days}
            tooltip={{
              accessor: (d) => {
                const hour = hours[d.hour];
                const day = days[d.day];
                return `${day} ${hour}\nRevenue: ${d.value.toLocaleString()}`;
              },
            }}
          />
        </div>
        <Stats grouped={true} size="small" direction="horizontal">
          <Stats.Stat description="Peak hour" value={revenue.peakHour} />
          <Stats.Stat description="Peak day" value={revenue.peakDay} />
        </Stats>
      </Card.Body>
    </Card>
  );
};
