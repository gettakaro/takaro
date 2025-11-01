import { FC, useState } from 'react';
import {
  styled,
  Card,
  EChartsBar,
  EChartsPie,
  Skeleton,
  Chip,
  IconTooltip,
  Dialog,
  Button,
} from '@takaro/lib-components';
import { ProductMetricsDTO, OrderMetricsDTO } from '@takaro/apiclient';
import { AiOutlineShoppingCart as CartIcon, AiOutlineInfoCircle as InfoIcon } from 'react-icons/ai';
import { OrderStatusDistribution } from './OrderStatusDistribution';

interface ProductChartsProps {
  products?: ProductMetricsDTO;
  orders: OrderMetricsDTO;
  isLoading?: boolean;
}

const ChartsContainer = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[4]};
  grid-template-columns: 1fr;

  @media (min-width: 1200px) {
    grid-template-columns: 4fr 3fr 3fr;
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

const DeadStockWarning = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[2]};
  background: rgba(239, 68, 68, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin-top: ${({ theme }) => theme.spacing[2]};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.15);
    transform: translateY(-1px);
  }
`;

const DeadStockList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const DeadStockItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const DeadStockItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['0_5']};
`;

const DeadStockItemName = styled.span`
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: 500;
`;

const DeadStockItemDays = styled.span`
  font-size: ${({ theme }) => theme.fontSize.tiny};
  color: ${({ theme }) => theme.colors.textAlt};
`;

export const ProductCharts: FC<ProductChartsProps> = ({ products, orders, isLoading }) => {
  const [deadStockDialogOpen, setDeadStockDialogOpen] = useState(false);

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
          <Chip label={`${products?.totalProducts || 0} products`} color="primary" />
        </ChartHeader>
        <ChartContent>
          {isLoading ? (
            <Skeleton variant="rectangular" width="100%" height="100%" />
          ) : topItemsData.length > 0 ? (
            <EChartsBar
              data={topItemsData}
              xAccessor={(d: any) => d.name}
              yAccessor={(d: any) => d.revenue}
              seriesName="Revenue"
              showGrid={true}
              showLegend={false}
              tooltipFormatter={(params: any) => {
                if (Array.isArray(params) && params.length > 0) {
                  const data = topItemsData[params[0].dataIndex];
                  return `${data.name}<br/>Revenue: ${data.revenue.toLocaleString()}<br/>Quantity: ${data.quantity}`;
                }
                return '';
              }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <span style={{ color: '#9ca3af' }}>No product data available</span>
            </div>
          )}
        </ChartContent>
        {products?.deadStock && products.deadStock > 0 && (
          <DeadStockWarning onClick={() => setDeadStockDialogOpen(true)}>
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
          {isLoading ? (
            <Skeleton variant="rectangular" width="100%" height="100%" />
          ) : categoryData.length > 0 ? (
            <EChartsPie
              data={categoryData}
              nameAccessor={(d: any) => d.name}
              valueAccessor={(d: any) => d.value}
              seriesName="Categories"
              donut={true}
              roseType="area"
              showLegend={true}
              center={['50%', '42%']}
              radius={['30%', '65%']}
              legendOrient="horizontal"
              legendLeft="center"
              legendTop="bottom"
              tooltipFormatter={(params: any) => {
                return `${params.name}<br/>Revenue: ${params.value.toLocaleString()}<br/>${params.percent}% of total`;
              }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <span style={{ color: '#9ca3af' }}>No category data available</span>
            </div>
          )}
        </ChartContent>
      </ChartCard>

      <OrderStatusDistribution orders={orders} />

      {/* Dead Stock Dialog */}
      <Dialog open={deadStockDialogOpen} onOpenChange={setDeadStockDialogOpen}>
        <Dialog.Content>
          <Dialog.Heading>Products with No Sales</Dialog.Heading>
          <Dialog.Body>
            {products?.deadStockItems && products.deadStockItems.length > 0 ? (
              <>
                <div style={{ marginBottom: '16px', color: '#9ca3af', fontSize: '14px' }}>
                  These products have not sold in the selected period:
                </div>
                <DeadStockList>
                  {products.deadStockItems.map((item) => (
                    <DeadStockItem key={item.id}>
                      <DeadStockItemInfo>
                        <DeadStockItemName>{item.name}</DeadStockItemName>
                        <DeadStockItemDays>Created {item.daysSinceCreated} days ago</DeadStockItemDays>
                      </DeadStockItemInfo>
                    </DeadStockItem>
                  ))}
                </DeadStockList>
                {products.deadStock > products.deadStockItems.length && (
                  <div style={{ marginTop: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                    Showing {products.deadStockItems.length} of {products.deadStock} items with no sales
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>
                No detailed information available
              </div>
            )}
            <div style={{ marginTop: '24px' }}>
              <Button onClick={() => setDeadStockDialogOpen(false)} fullWidth>
                Close
              </Button>
            </div>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </ChartsContainer>
  );
};
