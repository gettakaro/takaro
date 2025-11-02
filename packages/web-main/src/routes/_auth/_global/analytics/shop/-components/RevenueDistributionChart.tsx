import { CategoryPerformanceDTO, ProductMetricsDTO } from '@takaro/apiclient';
import { Card, Chip, IconTooltip, RadialBarChart, Stats } from '@takaro/lib-components';
import { FC } from 'react';
import { AiOutlineInfoCircle as InfoIcon } from 'react-icons/ai';

interface RevenueDistributionChartProps {
  products: ProductMetricsDTO;
}

export const RevenueDistributionChart: FC<RevenueDistributionChartProps> = ({ products }) => {
  const mostPopularCategory = products.categories.reduce((prev, current) =>
    prev.revenue > current.revenue ? prev : current,
  );

  return (
    <Card>
      <Card.Title label="Revenue distribution">
        <IconTooltip icon={<InfoIcon />} size="small" color="white">
          Revenue distribution across product categories. Shows which categories drive the most sales and helps identify
          opportunities for category expansion or optimization.
        </IconTooltip>
        <Chip label={`${products.categories.length} categories`} color="primary" variant="outline" />
      </Card.Title>
      <Card.Body>
        <div style={{ position: 'relative', height: '350px' }}>
          <RadialBarChart<CategoryPerformanceDTO>
            name="Category performance"
            data={products.categories}
            xAccessor={(d) => d.name}
            yAccessor={(d) => d.revenue}
            tooltipAccessor={(d) => {
              return `${d.name}: ${d.revenue.toLocaleString()} ${d.percentage.toFixed(2)}%`;
            }}
          />
        </div>
        <Stats grouped={true} size="small" direction="horizontal">
          <Stats.Stat
            description="Top category"
            value={`${mostPopularCategory.name} ${mostPopularCategory.revenue.toLocaleString()}`}
          />
        </Stats>
      </Card.Body>
    </Card>
  );
};
