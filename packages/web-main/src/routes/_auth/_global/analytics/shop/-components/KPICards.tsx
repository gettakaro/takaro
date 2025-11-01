import { FC } from 'react';
import { styled, Stats, IconTooltip, useTheme } from '@takaro/lib-components';
import { KPIMetricsDTO } from '@takaro/apiclient';
import {
  AiOutlineDollar as DollarIcon,
  AiOutlineShoppingCart as CartIcon,
  AiOutlineUser as UserIcon,
  AiOutlineCalculator as CalculatorIcon,
  AiOutlineInfoCircle as InfoIcon,
} from 'react-icons/ai';

interface KPICardsProps {
  kpis: KPIMetricsDTO;
  isLoading?: boolean;
}

const KPIGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[4]};
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const IconCircle = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: ${({ color }) => `${color}20`};
  color: ${({ color }) => color};

  svg {
    width: 20px;
    height: 20px;
  }
`;

const StatWrapper = styled.div`
  position: relative;
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing['0_5']};
  font-size: ${({ theme }) => theme.fontSize.medium};
  color: ${({ theme }) => theme.colors.textAlt};
`;

export const KPICards: FC<KPICardsProps> = ({ kpis, isLoading }) => {
  const theme = useTheme();

  const cards = [
    {
      title: 'Total Revenue',
      value: kpis?.totalRevenue || 0,
      change: kpis?.revenueChange || 0,
      sparkline: kpis?.revenueSparkline,
      icon: <DollarIcon />,
      color: theme.colors.success,
      tooltip:
        'Total income from all completed and paid orders in the selected period. Calculated as the sum of (order amount × listing price) for each order.',
    },
    {
      title: 'Orders Today',
      value: kpis?.ordersToday || 0,
      change: kpis?.ordersChange || 0,
      icon: <CartIcon />,
      color: theme.colors.info,
      tooltip:
        'Number of orders placed in the last 24 hours. Includes orders with all statuses (paid, completed, and canceled).',
    },
    {
      title: 'Active Customers',
      value: kpis?.activeCustomers || 0,
      change: kpis?.customersChange || 0,
      icon: <UserIcon />,
      color: theme.colors.info,
      tooltip:
        'Unique players who have made at least one purchase in the selected period. A customer is counted only once regardless of order count.',
    },
    {
      title: 'Avg Order Value',
      value: kpis?.averageOrderValue || 0,
      change: kpis?.aovChange || 0,
      icon: <CalculatorIcon />,
      color: theme.colors.warning,
      tooltip:
        'Average amount spent per order. Calculated as total revenue divided by the number of orders. Higher values indicate customers are buying more per transaction.',
    },
  ];

  return (
    <KPIGrid>
      {cards.map((card) => {
        const trendDirection = card.change > 0 ? 'up' : card.change < 0 ? 'down' : undefined;
        const trendValue = card.change !== 0 ? `${Math.abs(card.change).toFixed(1)}% vs last period` : undefined;

        return (
          <StatWrapper key={card.title}>
            <StatHeader>
              {card.title}
              <IconTooltip icon={<InfoIcon />} size="tiny" color="background">
                {card.tooltip}
              </IconTooltip>
            </StatHeader>
            <Stats direction="vertical" grouped={false} size="large">
              <Stats.Stat
                description={card.title}
                value={card.value.toFixed(0)}
                icon={<IconCircle color={card.color}>{card.icon}</IconCircle>}
                trend={trendDirection && trendValue ? { direction: trendDirection, value: trendValue } : undefined}
                isLoading={isLoading}
              />
            </Stats>
          </StatWrapper>
        );
      })}
    </KPIGrid>
  );
};
