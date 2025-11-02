import { OrderMetricsDTO } from '@takaro/apiclient';
import { Card, IconTooltip, Stats, styled, useTheme } from '@takaro/lib-components';
import { FC } from 'react';

import {
  AiOutlineShoppingCart as CartIcon,
  AiOutlineCheckCircle as CheckIcon,
  AiOutlineCloseCircle as CancelIcon,
  AiOutlineClockCircle as PendingIcon,
  AiOutlineInfoCircle as InfoIcon,
} from 'react-icons/ai';

interface OrderStatusDistributionProps {
  orders: OrderMetricsDTO;
}

// Minimal styled components for status list layout
const StatusList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

const StatusLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const StatusIconCircle = styled.div<{ $color: string }>`
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

const StatusRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const StatusCount = styled.span`
  font-size: ${({ theme }) => theme.fontSize.large};
  font-weight: bold;
`;

const StatusPercent = styled.span`
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.textAlt};
`;

// Styled wrapper for conditional icon coloring
const ColoredIconWrapper = styled.div<{ $color: string }>`
  color: ${({ $color }) => $color};
  display: flex;
`;

export const OrderStatusDistribution: FC<OrderStatusDistributionProps> = ({ orders }) => {
  const theme = useTheme();
  const statusData = orders.statusBreakdown;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { icon: <CheckIcon />, color: theme.colors.success };
      case 'CANCELED':
        return { icon: <CancelIcon />, color: theme.colors.error };
      case 'PAID':
        return { icon: <PendingIcon />, color: theme.colors.warning };
      default:
        return { icon: <CartIcon />, color: theme.colors.textAlt };
    }
  };

  return (
    <Card>
      <Card.Title label="Order Status Distribution">
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing['0_5'] }}>
          <IconTooltip icon={<InfoIcon />} size="small" color="white">
            Breakdown of orders by status (Paid, Completed, Canceled). Helps monitor order fulfillment rates and
            identify potential issues with order completion.
          </IconTooltip>
        </div>
      </Card.Title>
      <Card.Body>
        <div style={{ minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {statusData.length > 0 ? (
            <StatusList>
              {statusData.map((status) => {
                const { icon, color } = getStatusIcon(status.status);
                return (
                  <StatusItem key={status.status}>
                    <StatusLeft>
                      <StatusIconCircle $color={color}>{icon}</StatusIconCircle>
                      <StatusLabel>{status.status}</StatusLabel>
                    </StatusLeft>
                    <StatusRight>
                      <StatusCount>{status.count}</StatusCount>
                      <StatusPercent>({status.percentage.toFixed(1)}%)</StatusPercent>
                    </StatusRight>
                  </StatusItem>
                );
              })}
            </StatusList>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <span style={{ color: theme.colors.textAlt }}>No order data available</span>
            </div>
          )}
          <Stats direction="horizontal" grouped={true} size="small">
            <Stats.Stat
              description="Completion Rate"
              value={`${orders.completionRate.toFixed(1)}%`}
              icon={
                <ColoredIconWrapper $color={orders.completionRate > 80 ? theme.colors.success : theme.colors.warning}>
                  <CheckIcon />
                </ColoredIconWrapper>
              }
            />
            <Stats.Stat description="Total order count" value={orders.totalOrders} icon={<CartIcon />} />
          </Stats>
        </div>
      </Card.Body>
    </Card>
  );
};
