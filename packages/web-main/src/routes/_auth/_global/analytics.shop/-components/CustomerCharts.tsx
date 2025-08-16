import { FC, useState } from 'react';
import { styled, Card, EChartsPie, Skeleton, Chip, Avatar, IconTooltip, Dialog, Button } from '@takaro/lib-components';
import { CustomerMetricsDTO, OrderMetricsDTO } from '@takaro/apiclient';
import { DateTime } from 'luxon';
import {
  AiOutlineUser as UserIcon,
  AiOutlineClockCircle as ClockIcon,
  AiOutlineInfoCircle as InfoIcon,
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
    grid-template-columns: 1fr 1fr;
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

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
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
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundAccent};
    transform: translateX(2px);
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
  color: ${({ theme, $isLarge }) => ($isLarge ? theme.colors.success : theme.colors.text)};
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

const TopBuyersContainer = styled.div`
  margin-top: auto;
  padding: ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const TopBuyersHeader = styled.div`
  font-size: ${({ theme }) => theme.fontSize.tiny};
  font-weight: bold;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['0_5']};
  color: ${({ theme }) => theme.colors.text};
`;

const TopBuyerItem = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.fontSize.tiny};
  margin-bottom: ${({ theme }) => theme.spacing['0_5']};
`;

const TopBuyerRank = styled.span`
  color: ${({ theme }) => theme.colors.text};
`;

const TopBuyerAmount = styled.span`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: ${({ theme }) => `${theme.spacing['0_5']} ${theme.spacing[1]}`};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: ${({ theme }) => theme.fontSize.tiny};
  font-weight: 600;
  text-transform: uppercase;
  background: ${({ theme, $status }) => {
    switch ($status) {
      case 'COMPLETED':
        return theme.colors.success + '20';
      case 'PAID':
        return theme.colors.warning + '20';
      case 'CANCELED':
        return theme.colors.error + '20';
      default:
        return theme.colors.backgroundAlt;
    }
  }};
  color: ${({ theme, $status }) => {
    switch ($status) {
      case 'COMPLETED':
        return theme.colors.success;
      case 'PAID':
        return theme.colors.warning;
      case 'CANCELED':
        return theme.colors.error;
      default:
        return theme.colors.text;
    }
  }};
`;

const DialogSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const DialogLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSize.tiny};
  color: ${({ theme }) => theme.colors.textAlt};
  margin-bottom: ${({ theme }) => theme.spacing['0_5']};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DialogValue = styled.div`
  font-size: ${({ theme }) => theme.fontSize.medium};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`;

const DialogGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[3]};
`;

export const CustomerCharts: FC<CustomerChartsProps> = ({ customers, orders, isLoading }) => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Prepare customer segments data for PieChart
  const segmentData =
    customers?.segments?.map((segment) => ({
      name: segment.name,
      value: segment.count,
      percentage: segment.percentage,
    })) || [];

  // Recent orders data
  const recentOrders = orders?.recentOrders || [];

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  return (
    <ChartsContainer>
      <ChartCard>
        <ChartHeader>
          <ChartTitle>
            Customer Segments
            <IconTooltip icon={<InfoIcon />} size="small" color="background">
              Classification of customers by purchase frequency. New = 1 order, Returning = 2-4 orders, Frequent = 5+
              orders. Helps understand customer loyalty and engagement patterns.
            </IconTooltip>
          </ChartTitle>
          <Chip label={`${customers?.totalCustomers || 0} total`} color="primary" variant="outline" />
        </ChartHeader>
        <ChartContent>
          {isLoading ? (
            <Skeleton variant="rectangular" width="100%" height="100%" />
          ) : segmentData.length > 0 ? (
            <>
              <div style={{ height: '200px' }}>
                <EChartsPie
                  data={segmentData}
                  nameAccessor={(d: any) => d.name}
                  valueAccessor={(d: any) => d.value}
                  seriesName="Customers"
                  donut={true}
                  showLegend={true}
                  tooltipFormatter={(params: any) => {
                    return `${params.name}<br/>Customers: ${params.value} (${params.percent}%)`;
                  }}
                />
              </div>
              <StatsBox>
                <Stat>
                  <StatLabel>Repeat Rate</StatLabel>
                  <StatValue>{customers?.repeatRate?.toFixed(1) || 0}%</StatValue>
                </Stat>
                <Stat>
                  <StatLabel>Avg Lifetime Value</StatLabel>
                  <StatValue>0</StatValue>
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
          <ChartTitle>
            Recent Orders
            <IconTooltip icon={<InfoIcon />} size="small" color="background">
              Latest 10 orders showing player, item, value and time. Helps monitor real-time shop activity and quickly
              identify any issues with orders or popular items.
            </IconTooltip>
          </ChartTitle>
          <Chip label="Live" color="success" variant="outline" />
        </ChartHeader>
        <ChartContent>
          {isLoading ? (
            <Skeleton variant="rectangular" width="100%" height="100%" />
          ) : (
            <OrdersList>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <OrderItem key={order.id} onClick={() => handleOrderClick(order)}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <StatusBadge $status={order.status}>
                        {order.status === 'COMPLETED' ? '✓' : ''} {order.status}
                      </StatusBadge>
                      <OrderValue $isLarge={order.value > 100}>{order.value.toFixed(0)}</OrderValue>
                    </div>
                  </OrderItem>
                ))
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <span style={{ color: '#9ca3af' }}>No recent orders</span>
                </div>
              )}
            </OrdersList>
          )}
          {customers?.topBuyers && customers.topBuyers.length > 0 && !isLoading && (
            <TopBuyersContainer>
              <TopBuyersHeader>
                Top Buyers
                <IconTooltip icon={<InfoIcon />} size="tiny" color="background">
                  Players ranked by total amount spent. Includes order count and last purchase date to identify your
                  most valuable customers and target them with special offers.
                </IconTooltip>
              </TopBuyersHeader>
              {customers.topBuyers.slice(0, 3).map((buyer, index) => (
                <TopBuyerItem key={buyer.id}>
                  <TopBuyerRank>
                    {index + 1}. {buyer.name}
                  </TopBuyerRank>
                  <TopBuyerAmount>{buyer.totalSpent.toFixed(0)}</TopBuyerAmount>
                </TopBuyerItem>
              ))}
            </TopBuyersContainer>
          )}
        </ChartContent>
      </ChartCard>

      {/* Order Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Content>
          <Dialog.Heading>Order Details</Dialog.Heading>
          <Dialog.Body>
            {selectedOrder && (
              <>
                <DialogSection>
                  <DialogGrid>
                    <div>
                      <DialogLabel>Customer</DialogLabel>
                      <DialogValue style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar size="tiny">
                          <UserIcon />
                        </Avatar>
                        {selectedOrder.playerName}
                      </DialogValue>
                    </div>
                    <div>
                      <DialogLabel>Status</DialogLabel>
                      <DialogValue>
                        <StatusBadge $status={selectedOrder.status}>
                          {selectedOrder.status === 'COMPLETED' ? '✓' : ''} {selectedOrder.status}
                        </StatusBadge>
                      </DialogValue>
                    </div>
                  </DialogGrid>
                </DialogSection>

                <DialogSection>
                  <DialogGrid>
                    <div>
                      <DialogLabel>Item</DialogLabel>
                      <DialogValue>{selectedOrder.itemName}</DialogValue>
                    </div>
                    <div>
                      <DialogLabel>Value</DialogLabel>
                      <DialogValue style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#10b981' }}>
                        {selectedOrder.value.toFixed(2)}
                      </DialogValue>
                    </div>
                  </DialogGrid>
                </DialogSection>

                <DialogSection>
                  <DialogGrid>
                    <div>
                      <DialogLabel>Order Time</DialogLabel>
                      <DialogValue>
                        {DateTime.fromISO(selectedOrder.time || DateTime.now().toISO()).toLocaleString(
                          DateTime.DATETIME_MED,
                        )}
                      </DialogValue>
                    </div>
                    <div>
                      <DialogLabel>Order ID</DialogLabel>
                      <DialogValue style={{ fontSize: '0.85em', fontFamily: 'monospace', opacity: 0.7 }}>
                        {selectedOrder.id}
                      </DialogValue>
                    </div>
                  </DialogGrid>
                </DialogSection>

                <div style={{ marginTop: '24px' }}>
                  <Button onClick={() => setDialogOpen(false)} fullWidth>
                    Close
                  </Button>
                </div>
              </>
            )}
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </ChartsContainer>
  );
};
