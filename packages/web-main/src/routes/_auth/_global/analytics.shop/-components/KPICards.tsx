import { FC } from 'react';
import { styled, Card, Skeleton, IconTooltip } from '@takaro/lib-components';
import { motion, AnimatePresence } from 'framer-motion';
import { KPIMetricsDTO } from '@takaro/apiclient';
import {
  AiOutlineArrowUp as ArrowUpIcon,
  AiOutlineArrowDown as ArrowDownIcon,
  AiOutlineDollar as DollarIcon,
  AiOutlineShoppingCart as CartIcon,
  AiOutlineUser as UserIcon,
  AiOutlineCalculator as CalculatorIcon,
  AiOutlineInfoCircle as InfoIcon,
} from 'react-icons/ai';

interface KPICardsProps {
  kpis?: KPIMetricsDTO;
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

const KPICard = styled(Card)<{ $trend?: 'positive' | 'negative' | 'neutral' }>`
  position: relative;
  overflow: hidden;
  background: ${({ theme, $trend }) =>
    $trend === 'positive'
      ? `linear-gradient(135deg, ${theme.colors.background}, rgba(60, 205, 106, 0.1))`
      : $trend === 'negative'
        ? `linear-gradient(135deg, ${theme.colors.background}, rgba(239, 68, 68, 0.1))`
        : theme.colors.background};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.elevation[400]};
  }

  transition: all 0.2s ease;
`;

const KPIHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const KPITitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSize.medium};
  color: ${({ theme }) => theme.colors.textAlt};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const KPIIcon = styled.div<{ $color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${({ $color }) => ($color ? `${$color}20` : 'rgba(99, 102, 241, 0.1)')};
  color: ${({ $color }) => $color || '#6366f1'};

  svg {
    width: 20px;
    height: 20px;
  }
`;

const KPIValue = styled.div`
  font-size: ${({ theme }) => theme.fontSize.huge};
  font-weight: bold;
  margin: ${({ theme }) => theme.spacing[2]} 0;
`;

const KPIChange = styled.div<{ $trend: 'positive' | 'negative' | 'neutral' }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme, $trend }) =>
    $trend === 'positive' ? theme.colors.success : $trend === 'negative' ? theme.colors.error : theme.colors.textAlt};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const SparklineContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  opacity: 0.3;
`;

const Sparkline: FC<{ data?: number[] }> = ({ data = [] }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

const formatValue = (value: number, type: 'currency' | 'number') => {
  if (type === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  return new Intl.NumberFormat('en-US').format(value);
};

const formatChange = (value: number) => {
  const formatted = Math.abs(value).toFixed(1);
  return value >= 0 ? `+${formatted}%` : `-${formatted}%`;
};

export const KPICards: FC<KPICardsProps> = ({ kpis, isLoading }) => {
  if (isLoading) {
    return (
      <KPIGrid>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height="140px" />
        ))}
      </KPIGrid>
    );
  }

  const cards = [
    {
      title: 'Total Revenue',
      value: kpis?.totalRevenue || 0,
      change: kpis?.revenueChange || 0,
      sparkline: kpis?.revenueSparkline,
      icon: <DollarIcon />,
      type: 'currency' as const,
      color: '#10b981',
      tooltip:
        'Total income from all completed and paid orders in the selected period. Calculated as the sum of (order amount × listing price) for each order.',
    },
    {
      title: 'Orders Today',
      value: kpis?.ordersToday || 0,
      change: kpis?.ordersChange || 0,
      icon: <CartIcon />,
      type: 'number' as const,
      color: '#3b82f6',
      tooltip:
        'Number of orders placed in the last 24 hours. Includes orders with all statuses (paid, completed, and canceled).',
    },
    {
      title: 'Active Customers',
      value: kpis?.activeCustomers || 0,
      change: kpis?.customersChange || 0,
      icon: <UserIcon />,
      type: 'number' as const,
      color: '#8b5cf6',
      tooltip:
        'Unique players who have made at least one purchase in the selected period. A customer is counted only once regardless of order count.',
    },
    {
      title: 'Avg Order Value',
      value: kpis?.averageOrderValue || 0,
      change: kpis?.aovChange || 0,
      icon: <CalculatorIcon />,
      type: 'currency' as const,
      color: '#f59e0b',
      tooltip:
        'Average amount spent per order. Calculated as total revenue divided by the number of orders. Higher values indicate customers are buying more per transaction.',
    },
  ];

  return (
    <KPIGrid>
      <AnimatePresence>
        {cards.map((card, index) => {
          const trend = card.change > 0 ? 'positive' : card.change < 0 ? 'negative' : 'neutral';

          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <KPICard $trend={trend}>
                <KPIHeader>
                  <KPITitle>
                    {card.title}
                    <IconTooltip icon={<InfoIcon />} size="tiny">
                      {card.tooltip}
                    </IconTooltip>
                  </KPITitle>
                  <KPIIcon $color={card.color}>{card.icon}</KPIIcon>
                </KPIHeader>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                >
                  <KPIValue>{formatValue(card.value, card.type)}</KPIValue>
                </motion.div>

                <KPIChange $trend={trend}>
                  {trend === 'positive' && <ArrowUpIcon />}
                  {trend === 'negative' && <ArrowDownIcon />}
                  {formatChange(card.change)}
                  <span style={{ opacity: 0.7 }}>vs last period</span>
                </KPIChange>

                {card.sparkline && (
                  <SparklineContainer>
                    <Sparkline data={card.sparkline} />
                  </SparklineContainer>
                )}
              </KPICard>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </KPIGrid>
  );
};
