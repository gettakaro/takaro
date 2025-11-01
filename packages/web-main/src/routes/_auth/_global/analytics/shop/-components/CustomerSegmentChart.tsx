import { CustomerMetricsDTO } from '@takaro/apiclient';
import { Card, Chip, IconTooltip, PieChart, Stats, styled } from '@takaro/lib-components';
import { FC } from 'react';
import { AiOutlineInfoCircle as InfoIcon, AiOutlineReload, AiOutlineDollar } from 'react-icons/ai';

const ChartContent = styled.div`
  position: relative;
  height: 300px;
`;

interface CustomerSegmentChartProps {
  customers: CustomerMetricsDTO;
}

export const CustomerSegmentChart: FC<CustomerSegmentChartProps> = ({ customers }) => {
  const segmentData =
    customers.segments.map((segment) => ({
      name: segment.name,
      value: segment.count,
      percentage: segment.percentage,
    })) || [];

  return (
    <Card>
      <Card.Title label="Customer Segments">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IconTooltip icon={<InfoIcon />} color="background">
            Time-based customer segmentation. New = first-time buyers in current period with no prior history. Returning
            = customers with purchase history who don't qualify as frequent. Frequent = customers with 3+ consecutive
            months of purchases OR 4+ total months with purchases in the last 6 months. Helps identify true customer
            loyalty patterns over time.
          </IconTooltip>
          <Chip label={`${customers?.totalCustomers || 0} total`} color="primary" variant="outline" />
        </div>
      </Card.Title>
      <Card.Body>
        <ChartContent>
          <PieChart
            name="Customers"
            data={segmentData}
            xAccessor={(d) => d.name}
            yAccessor={(d) => d.value + 5}
            innerRadius={0.6}
            labelPosition="inside"
            legendPosition="left"
            tooltip={{
              accessor: (d) => `${d.name}: ${d.value} (${d.percentage.toFixed(1)}%)`,
            }}
          />
        </ChartContent>
        <Stats direction="horizontal" grouped size="small">
          <Stats.Stat
            description="Repeat Rate"
            value={`${customers?.repeatRate?.toFixed(1) || 0}%`}
            icon={<AiOutlineReload />}
          />
          <Stats.Stat description="Avg Lifetime Value" value={0} icon={<AiOutlineDollar />} />
        </Stats>
      </Card.Body>
    </Card>
  );
};
