import { styled } from '../../../styled';
import { useTheme } from '../../../hooks';
import { Card, ProgressBar, QuestionTooltip } from '../../../components';
import { FC } from 'react';
import { UsageProps } from './Usage';

const TitleContainer = styled.div<{ margin: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ margin, theme }) => (margin ? theme.spacing['2'] : 0)};
`;

const DetailsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[1]};

  h2 {
    font-size: 2.25rem;
    font-weight: 600;
  }
  span {
    backgroundcolor: ${({ theme }) => theme.spacing[1]};
    border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
    font-size: ${({ theme }) => theme.fontSize.mediumLarge};
    padding: ${({ theme }) => `${theme.spacing['0_25']} ${theme.spacing['0_75']}`};
    border-radius: ${({ theme }) => theme.borderRadius.small};
  }
`;

export interface UsageCardProps extends UsageProps {
  title: string;
  description?: string;
  info?: string;
}

export const UsageCard: FC<UsageCardProps> = ({ title, value, total, info, unit, description }) => {
  const theme = useTheme();
  const used_percentage = Math.min((value / total) * 100, 100);
  const remaining = Math.max(total - value, 0);
  const formatter = new Intl.NumberFormat('en', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  });

  return (
    <Card style={{ maxWidth: '800px' }}>
      <Card.Body>
        <TitleContainer margin={description ? false : true}>
          <h3>{title}</h3>
          {info && (
            <IconTooltip placement="top" color="background" icon={<QuestionIcon />}>
              {info}
            </IconTooltip>
          )}
        </TitleContainer>
        {description && <p style={{ color: theme.colors.textAlt, marginBottom: theme.spacing[2] }}>{description}</p>}
        <DetailsContainer>
          <h2>
            {formatter.format(value)} / {formatter.format(total)} {unit}
          </h2>
          <span>{formatter.format(remaining)} remaining</span>
        </DetailsContainer>
        <ProgressBar mode="determinate" value={used_percentage} size="medium" />
      </Card.Body>
    </Card>
  );
};
