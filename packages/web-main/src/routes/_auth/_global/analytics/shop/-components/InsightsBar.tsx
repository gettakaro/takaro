import { FC } from 'react';
import { styled } from '@takaro/lib-components';
import { InsightCard, InsightType } from '../../../../../../components/cards/InsightCard';

interface InsightsBarProps {
  insights: Array<{
    type: InsightType;
    title: string;
    description: string;
    value?: string | number;
    action?: string;
  }>;
}

const InsightsContainer = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

export const InsightsBar: FC<InsightsBarProps> = ({ insights }) => {
  return (
    <InsightsContainer>
      {insights.map((insight, _index) => (
        <InsightCard
          key={'insight-' + _index}
          type={insight.type as InsightType}
          title={insight.title}
          description={insight.description}
          value={insight.value}
        />
      ))}
    </InsightsContainer>
  );
};
