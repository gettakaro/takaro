import { FC } from 'react';
import { styled, Card, PieChart, LineChart, Skeleton, Chip, Avatar } from '@takaro/lib-components';
import { CustomerMetricsDTO, OrderMetricsDTO } from '@takaro/apiclient';
import { DateTime } from 'luxon';
import { 
  AiOutlineUser as UserIcon,
  AiOutlineClockCircle as ClockIcon
} from 'react-icons/ai';

interface CustomerChartsProps {
  customers?: CustomerMetricsDTO;
  orders?: OrderMetricsDTO;
  isLoading?: boolean;
}

const ChartsContainer = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[4]};
  grid-template-columns: 1fr;
  
  @media (min-width: 1200px) {
    grid-template-columns: 35% 35% 30%;
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

const SegmentLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[3]};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.small};
`;

const LegendInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const LegendDot = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

const LegendLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSize.small};
`;

const LegendValue = styled.span`
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.textAlt};
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  overflow-y: auto;
  max-height: 320px;
`;

const OrderItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.backgroundAccent};
  }
`;

const OrderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const OrderDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[0.5]};
`;

const OrderPlayer = styled.span`
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: 500;
`;

const OrderMeta = styled.span`
  font-size: ${({ theme }) => theme.fontSize.tiny};
  color: ${({ theme }) => theme.colors.textAlt};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const OrderValue = styled.div<{ $isLarge?: boolean }>`
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: bold;
  color: ${({ theme, $isLarge }) => $isLarge ? theme.colors.success : theme.colors.text};
`;

const RepeatBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  padding: ${({ theme }) => theme.spacing[0.5]} ${({ theme }) => theme.spacing[1.5]};
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: ${({ theme }) => theme.fontSize.tiny};
`;

const StatsBox = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[0.5]};
`;

const StatLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSize.tiny};
  color: ${({ theme }) => theme.colors.textAlt};
`;

const StatValue = styled.span`
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: bold;
`;

export const CustomerCharts: FC<CustomerChartsProps> = ({ customers, orders, isLoading }) => {
  if (isLoading) {
    return (
      <ChartsContainer>
        <Skeleton variant="rectangular" height="400px" />
        <Skeleton variant="rectangular" height="400px" />
        <Skeleton variant="rectangular" height="400px" />
      </ChartsContainer>
    );
  }
  
  // Prepare customer segments data for PieChart
  const segmentData = customers?.segments?.map(segment => ({
    name: segment.name,
    value: segment.count,
    percentage: segment.percentage
  })) || [];
  
  const segmentColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];
  
  // Prepare purchase timeline data for LineChart
  const timelineData: any[] = [];
  
  // Recent orders data
  const recentOrders = orders?.recentOrders || [];
  
  return (
    <ChartsContainer>
      <ChartCard>
        <ChartHeader>
          <ChartTitle>Customer Segments</ChartTitle>
          <Chip 
            label={`${customers?.totalCustomers || 0} total`}
            color="primary"
            variant="outline"
          />
        </ChartHeader>
        <ChartContent>
          {segmentData.length > 0 ? (
            <>
              <div style={{ height: '200px' }}>
                <PieChart
                  name="Customer Segments"
                  data={segmentData}
                  variant="donut"
                  xAccessor={(d: any) => d.name}
                  yAccessor={(d: any) => d.value}
                  tooltipAccessor={(d: any) => `${d.name}: ${d.value}`}
                />
              </div>
              <SegmentLegend>
                {segmentData.map((segment, index) => (
                  <LegendItem key={segment.name}>
                    <LegendInfo>
                      <LegendDot $color={segmentColors[index % segmentColors.length]} />
                      <LegendLabel>{segment.name}</LegendLabel>
                    </LegendInfo>
                    <LegendValue>
                      {segment.value} ({segment.percentage.toFixed(1)}%)
                    </LegendValue>
                  </LegendItem>
                ))}
              </SegmentLegend>
              <StatsBox>
                <Stat>
                  <StatLabel>Repeat Rate</StatLabel>
                  <StatValue>{customers?.repeatRate?.toFixed(1) || 0}%</StatValue>
                </Stat>
                <Stat>
                  <StatLabel>Avg Lifetime Value</StatLabel>
                  <StatValue>$0</StatValue>
                </Stat>
              </StatsBox>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <span style={{ color: '#9ca3af' }}>No customer data available</span>
            </div>
          )}
        </ChartContent>
      </ChartCard>
      
      <ChartCard>
        <ChartHeader>
          <ChartTitle>Purchase Timeline</ChartTitle>
        </ChartHeader>
        <ChartContent>
          {timelineData.length > 0 ? (
            <>
              <LineChart
                name="Purchase Timeline"
                data={timelineData.length > 0 ? timelineData : [{date: new Date(), purchases: 0}]}
                xAccessor={(d: any) => new Date(d.date)}
                yAccessor={(d: any) => d.purchases}
                showGrid
              />
              <StatsBox>
                <Stat>
                  <StatLabel>Peak Day</StatLabel>
                  <StatValue>N/A</StatValue>
                </Stat>
                <Stat>
                  <StatLabel>Avg Daily Customers</StatLabel>
                  <StatValue>0</StatValue>
                </Stat>
              </StatsBox>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <span style={{ color: '#9ca3af' }}>No timeline data available</span>
            </div>
          )}
        </ChartContent>
      </ChartCard>
      
      <ChartCard>
        <ChartHeader>
          <ChartTitle>Recent Orders</ChartTitle>
          <Chip 
            label="Live"
            color="success"
            variant="outline"
          />
        </ChartHeader>
        <ChartContent>
          <OrdersList>
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <OrderItem key={order.id}>
                  <OrderInfo>
                    <Avatar size="tiny">
                      <UserIcon />
                    </Avatar>
                    <OrderDetails>
                      <OrderPlayer>{order.playerName}</OrderPlayer>
                      <OrderMeta>
                        <ClockIcon style={{ width: '12px', height: '12px' }} />
                        {DateTime.fromISO(order.time || DateTime.now().toISO()).toRelative()}
                      </OrderMeta>
                    </OrderDetails>
                  </OrderInfo>
                  <OrderValue $isLarge={order.value > 100}>
                    ${order.value.toFixed(0)}
                  </OrderValue>
                </OrderItem>
              ))
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <span style={{ color: '#9ca3af' }}>No recent orders</span>
              </div>
            )}
          </OrdersList>
          {customers?.topBuyers && customers.topBuyers.length > 0 && (
            <div style={{ marginTop: 'auto', padding: '12px', background: '#f3f4f6', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Top Buyers</div>
              {customers.topBuyers.slice(0, 3).map((buyer, index) => (
                <div key={buyer.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span>{index + 1}. {buyer.name}</span>
                  <span style={{ fontWeight: 'bold' }}>${buyer.totalSpent.toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </ChartContent>
      </ChartCard>
    </ChartsContainer>
  );
};