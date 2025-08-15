import { FC } from 'react';
import { styled, Card, BarChart, RadialBarChart, Skeleton, Chip, IconTooltip } from '@takaro/lib-components';
import { ProductMetricsDTO, OrderMetricsDTO } from '@takaro/apiclient';
import {
  AiOutlineShoppingCart as CartIcon,
  AiOutlineCheckCircle as CheckIcon,
  AiOutlineCloseCircle as CancelIcon,
  AiOutlineClockCircle as PendingIcon,
  AiOutlineInfoCircle as InfoIcon,
} from 'react-icons/ai';

interface ProductChartsProps {
  products?: ProductMetricsDTO;
  orders?: OrderMetricsDTO;
  isLoading?: boolean;
}

const ChartsContainer = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[4]};
  grid-template-columns: 1fr;

  @media (min-width: 1200px) {
    grid-template-columns: 40% 30% 30%;
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

const StatusFlow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[2]};
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const StatusInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const StatusIcon = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ $color }) => `${$color}20`};
  color: ${({ $color }) => $color};
`;

const StatusLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSize.medium};
`;

const StatusValue = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const StatusCount = styled.span`
  font-size: ${({ theme }) => theme.fontSize.large};
  font-weight: bold;
`;

const StatusPercent = styled.span`
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.textAlt};
`;

const DeadStockWarning = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[2]};
  background: rgba(239, 68, 68, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

export const ProductCharts: FC<ProductChartsProps> = ({ products, orders, isLoading }) => {
  if (isLoading) {
    return (
      <ChartsContainer>
        <Skeleton variant="rectangular" height="400px" />
        <Skeleton variant="rectangular" height="400px" />
        <Skeleton variant="rectangular" height="400px" />
      </ChartsContainer>
    );
  }

  // Prepare data for top items bar chart
  const topItemsData =
    products?.topItems?.map((item) => ({
      name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
      revenue: item.revenue,
      quantity: item.quantity,
      percentage: item.percentage,
    })) || [];

  // Prepare data for category radial chart
  const categoryData =
    products?.categories?.map((cat) => ({
      name: cat.name,
      value: cat.revenue,
      percentage: cat.percentage,
    })) || [];

  // Order status data
  const statusData = orders?.statusBreakdown || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { icon: <CheckIcon />, color: '#10b981' };
      case 'CANCELED':
        return { icon: <CancelIcon />, color: '#ef4444' };
      case 'PAID':
        return { icon: <PendingIcon />, color: '#f59e0b' };
      default:
        return { icon: <CartIcon />, color: '#6b7280' };
    }
  };

  return (
    <ChartsContainer>
      <ChartCard>
        <ChartHeader>
          <ChartTitle>
            Top Selling Items
            <IconTooltip icon={<InfoIcon />} size="small" color="background">
              Products ranked by total revenue generated. Shows both quantity sold and revenue contribution. Helps
              identify your best-performing products and inventory needs.
            </IconTooltip>
          </ChartTitle>
          <Chip label={`${products?.totalProducts || 0} products`} color="primary" variant="outline" />
        </ChartHeader>
        <ChartContent>
          {topItemsData.length > 0 ? (
            <BarChart
              name="Top Items"
              data={topItemsData}
              xAccessor={(d: any) => d.name}
              yAccessor={(d: any) => d.revenue}
              showGrid
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <span style={{ color: '#9ca3af' }}>No product data available</span>
            </div>
          )}
        </ChartContent>
        {products?.deadStock && products.deadStock > 0 && (
          <DeadStockWarning>
            <CartIcon style={{ color: '#ef4444' }} />
            <span>{products.deadStock} items with no sales in 30 days</span>
          </DeadStockWarning>
        )}
      </ChartCard>

      <ChartCard>
        <ChartHeader>
          <ChartTitle>
            Category Performance
            <IconTooltip icon={<InfoIcon />} size="small" color="background">
              Revenue distribution across product categories. Shows which categories drive the most sales and helps
              identify opportunities for category expansion or optimization.
            </IconTooltip>
          </ChartTitle>
        </ChartHeader>
        <ChartContent>
          {categoryData.length > 0 ? (
            <RadialBarChart
              name="Categories"
              data={categoryData}
              xAccessor={(d: any) => d.name}
              yAccessor={(d: any) => d.value}
              tooltipAccessor={(d: any) => `${d.name}: $${d.value}`}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <span style={{ color: '#9ca3af' }}>No category data available</span>
            </div>
          )}
        </ChartContent>
      </ChartCard>

      <ChartCard>
        <ChartHeader>
          <ChartTitle>
            Order Status Distribution
            <IconTooltip icon={<InfoIcon />} size="small" color="background">
              Breakdown of orders by status (Paid, Completed, Canceled). Helps monitor order fulfillment rates and
              identify potential issues with order completion.
            </IconTooltip>
          </ChartTitle>
          <Chip label={`${orders?.totalOrders || 0} total`} color="primary" variant="outline" />
        </ChartHeader>
        <ChartContent>
          <StatusFlow>
            {statusData.length > 0 ? (
              statusData.map((status) => {
                const { icon, color } = getStatusIcon(status.status);
                return (
                  <StatusItem key={status.status}>
                    <StatusInfo>
                      <StatusIcon $color={color}>{icon}</StatusIcon>
                      <StatusLabel>{status.status}</StatusLabel>
                    </StatusInfo>
                    <StatusValue>
                      <StatusCount>{status.count}</StatusCount>
                      <StatusPercent>({status.percentage.toFixed(1)}%)</StatusPercent>
                    </StatusValue>
                  </StatusItem>
                );
              })
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <span style={{ color: '#9ca3af' }}>No order data available</span>
              </div>
            )}
          </StatusFlow>
          {orders?.completionRate !== undefined && (
            <div style={{ marginTop: 'auto', padding: '12px', background: '#f3f4f6', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Completion Rate</span>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: orders.completionRate > 80 ? '#10b981' : '#f59e0b',
                  }}
                >
                  {orders.completionRate.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </ChartContent>
      </ChartCard>
    </ChartsContainer>
  );
};
