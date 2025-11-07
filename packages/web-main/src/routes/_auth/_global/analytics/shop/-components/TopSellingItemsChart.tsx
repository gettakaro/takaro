import { ProductMetricsDTO, TopItemDTO } from '@takaro/apiclient';
import { Alert, BarChart, Card, Chip, IconTooltip } from '@takaro/lib-components';
import { DeadStockDialog } from '../../../../../../components/dialogs/DeadStockDialog';
import { FC, useState } from 'react';
import { AiOutlineInfoCircle as InfoIcon } from 'react-icons/ai';

interface TopSellingItemsChartProps {
  products: ProductMetricsDTO;
}

export const TopSellingItemsChart: FC<TopSellingItemsChartProps> = ({ products }) => {
  const [showDeadStockDialog, setShowDeadStockDialog] = useState(false);

  return (
    <Card>
      <Card.Title label="Top 10 best selling items">
        <IconTooltip icon={<InfoIcon />} size="small" color="white">
          Products ranked by total revenue generated. Shows both quantity sold and revenue contribution. Helps identify
          your best-performing products and inventory needs.
        </IconTooltip>

        <Chip label={`${products.totalProducts} items`} color="primary" />
      </Card.Title>
      <Card.Body>
        <div style={{ position: 'relative', height: '350px' }}>
          <BarChart<TopItemDTO>
            data={products.topItems}
            xAccessor={(d) => d.name}
            yAccessor={(d) => d.revenue}
            axis={{
              numTicksY: 3,
            }}
            name="Revenue"
            barWidth={0.8}
            grid="none"
            tooltip={{
              enabled: true,
              accessor: (d) => {
                return `${d.name} Revenue: ${d.revenue.toLocaleString()} Quantity: ${d.quantity}`;
              },
            }}
          />
        </div>

        <Alert
          variant="info"
          text={`${products.deadStock} items with no sales in the last 30 days`}
          action={{ execute: () => setShowDeadStockDialog(true), text: 'View Details' }}
        />
      </Card.Body>

      <DeadStockDialog
        open={showDeadStockDialog}
        onOpenChange={setShowDeadStockDialog}
        deadStockItems={products.deadStockItems!}
        totalDeadStock={products.deadStock}
      />
    </Card>
  );
};
