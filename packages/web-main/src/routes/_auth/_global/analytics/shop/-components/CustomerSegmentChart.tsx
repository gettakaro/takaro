import { CustomerMetricsDTO } from '@takaro/apiclient';
import { Card, IconTooltip, PieChart, Stats, styled } from '@takaro/lib-components';
import { FC } from 'react';
import { AiOutlineInfoCircle as InfoIcon, AiOutlineReload, AiOutlineDollar } from 'react-icons/ai';

const StyledCard = styled(Card)`
  display: flex;
  flex-direction: column;
`;

const ChartContent = styled.div`
  position: relative;
  height: 300px;
`;

interface CustomerSegmentChartProps {
  customers: CustomerMetricsDTO;
}

const CenterContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const TotalCount = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
`;

const TotalLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textAlt};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const CustomerSegmentChart: FC<CustomerSegmentChartProps> = ({ customers }) => {
  const segmentData =
    customers.segments.map((segment) => ({
      name: segment.name,
      value: segment.count,
      percentage: segment.percentage,
    })) || [];

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <StyledCard>
      <Card.Title label="Customer Segments">
        <IconTooltip icon={<InfoIcon />} color="white">
          Time-based customer segmentation. New = first-time buyers in current period with no prior history. Returning =
          customers with purchase history who don't qualify as frequent. Frequent = customers with 3+ consecutive months
          of purchases OR 4+ total months with purchases in the last 6 months. Helps identify true customer loyalty
          patterns over time.
        </IconTooltip>
      </Card.Title>
      <Card.Body>
        <ChartContent>
          <PieChart
            name="Customers"
            data={segmentData}
            xAccessor={(d) => d.name}
            yAccessor={(d) => d.value}
            innerRadius={0.6}
            labelPosition="inside"
            legendPosition="left"
            cornerRadius={3}
            tooltip={{
              accessor: (d) => `${d.name}: ${d.value} (${d.percentage.toFixed(1)}%)`,
            }}
            centerContent={(totalValue) => (
              <CenterContent>
                <TotalCount>{formatNumber(totalValue)}</TotalCount>
                <TotalLabel>Total Customers</TotalLabel>
              </CenterContent>
            )}
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
    </StyledCard>
  );
};
