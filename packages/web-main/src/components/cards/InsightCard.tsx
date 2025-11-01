import { FC, ReactNode } from 'react';
import { styled, Card } from '@takaro/lib-components';
import { shade } from 'polished';
import {
  AiOutlineBulb as BulbIcon,
  AiOutlineWarning as WarningIcon,
  AiOutlineInfoCircle as InfoIcon,
  AiOutlineCheckCircle as CheckIcon,
} from 'react-icons/ai';
import { ThemeType } from '@takaro/lib-components';

export type InsightType = 'success' | 'warning' | 'info' | 'tip';

export interface InsightCardProps {
  type: InsightType;
  title: string;
  description: string;
  value?: string | number;
}

interface InsightTypeConfig {
  getColor: (theme: ThemeType) => string;
  icon: ReactNode;
}

const INSIGHT_TYPES: Record<InsightType, InsightTypeConfig> = {
  success: {
    getColor: (theme) => theme.colors.success,
    icon: <CheckIcon />,
  },
  warning: {
    getColor: (theme) => theme.colors.warning,
    icon: <WarningIcon />,
  },
  info: {
    getColor: (theme) => theme.colors.info,
    icon: <InfoIcon />,
  },
  tip: {
    getColor: (theme) => theme.colors.primary,
    icon: <BulbIcon />,
  },
};

const StyledCard = styled(Card)<{ $type: InsightType }>`
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme, $type }) => {
    const color = INSIGHT_TYPES[$type].getColor(theme);
    const gradientColor = shade(0.95, color);
    return `linear-gradient(135deg, ${theme.colors.background}, ${gradientColor})`;
  }};
  border-left: 3px solid ${({ theme, $type }) => INSIGHT_TYPES[$type].getColor(theme)};
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const InsightIcon = styled.div<{ $type: InsightType }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme, $type }) => {
    const color = INSIGHT_TYPES[$type].getColor(theme);
    return shade(0.8, color);
  }};
  color: ${({ theme, $type }) => INSIGHT_TYPES[$type].getColor(theme)};

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

export const InsightCard: FC<InsightCardProps> = ({ type, title, description, value }) => {
  const typeConfig = INSIGHT_TYPES[type];

  return (
    <StyledCard $type={type}>
      <InsightHeader>
        <InsightIcon $type={type}>{typeConfig.icon}</InsightIcon>
        <InsightTitle>{title}</InsightTitle>
        {value && <InsightValue>{value}</InsightValue>}
      </InsightHeader>
      <InsightDescription>{description}</InsightDescription>
    </StyledCard>
  );
};
