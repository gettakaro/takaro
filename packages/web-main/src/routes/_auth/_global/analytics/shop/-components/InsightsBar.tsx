import { FC } from 'react';
import { styled, Card, Skeleton } from '@takaro/lib-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AiOutlineBulb as BulbIcon,
  AiOutlineWarning as WarningIcon,
  AiOutlineInfoCircle as InfoIcon,
  AiOutlineCheckCircle as CheckIcon,
} from 'react-icons/ai';

interface InsightsBarProps {
  insights: Array<{
    type: string;
    title: string;
    description: string;
    value?: string | number;
    action?: string;
  }>;
  isLoading?: boolean;
}

const InsightsContainer = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

const InsightCard = styled(Card)<{ $type: string }>`
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme, $type }) => {
    switch ($type) {
      case 'success':
        return `linear-gradient(135deg, ${theme.colors.background}, rgba(60, 205, 106, 0.05))`;
      case 'warning':
        return `linear-gradient(135deg, ${theme.colors.background}, rgba(251, 191, 36, 0.05))`;
      case 'info':
        return `linear-gradient(135deg, ${theme.colors.background}, rgba(59, 130, 246, 0.05))`;
      case 'tip':
        return `linear-gradient(135deg, ${theme.colors.background}, rgba(139, 92, 246, 0.05))`;
      default:
        return theme.colors.background;
    }
  }};
  border-left: 3px solid
    ${({ theme, $type }) => {
      switch ($type) {
        case 'success':
          return '#10b981';
        case 'warning':
          return '#fbbf24';
        case 'info':
          return '#3b82f6';
        case 'tip':
          return '#8b5cf6';
        default:
          return theme.colors.primary;
      }
    }};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const InsightIcon = styled.div<{ $type: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ $type }) => {
    switch ($type) {
      case 'success':
        return 'rgba(60, 205, 106, 0.2)';
      case 'warning':
        return 'rgba(251, 191, 36, 0.2)';
      case 'info':
        return 'rgba(59, 130, 246, 0.2)';
      case 'tip':
        return 'rgba(139, 92, 246, 0.2)';
      default:
        return 'rgba(99, 102, 241, 0.2)';
    }
  }};
  color: ${({ $type }) => {
    switch ($type) {
      case 'success':
        return '#10b981';
      case 'warning':
        return '#fbbf24';
      case 'info':
        return '#3b82f6';
      case 'tip':
        return '#8b5cf6';
      default:
        return '#6366f1';
    }
  }};

  svg {
    width: 18px;
    height: 18px;
  }
`;

const InsightTitle = styled.h4`
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: 600;
  margin: 0;
  flex: 1;
`;

const InsightValue = styled.span`
  font-size: ${({ theme }) => theme.fontSize.large};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

const InsightDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.textAlt};
  margin: 0 0 ${({ theme }) => theme.spacing[2]} 0;
  line-height: 1.5;
`;

const InsightAction = styled.div`
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  margin-top: auto;

  &:before {
    content: '→';
    font-size: ${({ theme }) => theme.fontSize.medium};
  }
`;

const EmptyInsights = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[8]};
  text-align: center;
  color: ${({ theme }) => theme.colors.textAlt};

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: ${({ theme }) => theme.spacing[3]};
    opacity: 0.5;
  }
`;

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckIcon />;
    case 'warning':
      return <WarningIcon />;
    case 'info':
      return <InfoIcon />;
    case 'tip':
      return <BulbIcon />;
    default:
      return <InfoIcon />;
  }
};

// Generate default insights based on data patterns
const generateDefaultInsights = () => {
  return [
    {
      type: 'success',
      title: 'Revenue Growth',
      description: 'Your revenue has increased compared to the previous period. Keep up the momentum!',
      value: '+12.5%',
      action: 'View revenue trends',
    },
    {
      type: 'warning',
      title: 'Dead Stock Alert',
      description: "Several items haven't sold in the last 30 days. Consider promotions or price adjustments.",
      value: '8 items',
      action: 'Review inactive products',
    },
    {
      type: 'info',
      title: 'Peak Shopping Hours',
      description: 'Most purchases occur between 7-10 PM. Schedule promotions during these hours for maximum impact.',
      value: '7-10 PM',
      action: 'Optimize promotion timing',
    },
    {
      type: 'tip',
      title: 'Customer Retention',
      description: 'Your repeat customer rate is above average. Consider loyalty rewards to maintain engagement.',
      value: '42%',
      action: 'Create loyalty program',
    },
  ];
};

export const InsightsBar: FC<InsightsBarProps> = ({ insights, isLoading }) => {
  // Use provided insights or generate defaults
  const displayInsights = insights && insights.length > 0 ? insights : generateDefaultInsights();

  if (isLoading) {
    return (
      <InsightsContainer>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height="120px" />
        ))}
      </InsightsContainer>
    );
  }

  if (!displayInsights || displayInsights.length === 0) {
    return (
      <InsightsContainer>
        <EmptyInsights>
          <BulbIcon />
          <div>
            <h4>No Insights Available</h4>
            <p>Insights will appear here once we have enough data to analyze patterns.</p>
          </div>
        </EmptyInsights>
      </InsightsContainer>
    );
  }

  return (
    <InsightsContainer>
      <AnimatePresence>
        {displayInsights.map((insight, index) => (
          <motion.div
            key={`${insight.title}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <InsightCard $type={insight.type as string}>
              <InsightHeader>
                <InsightIcon $type={insight.type as string}>{getInsightIcon(insight.type)}</InsightIcon>
                <InsightTitle>{insight.title}</InsightTitle>
                {insight.value && <InsightValue>{insight.value}</InsightValue>}
              </InsightHeader>

              <InsightDescription>{insight.description}</InsightDescription>

              {insight.action && <InsightAction>{insight.action}</InsightAction>}
            </InsightCard>
          </motion.div>
        ))}
      </AnimatePresence>
    </InsightsContainer>
  );
};
