import { FC, useContext, ReactNode, cloneElement, isValidElement } from 'react';
import { styled, Size } from '../../../styled';
import { StatContext, Direction } from './context';
import { AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai';

const Container = styled.div<{ isGrouped: boolean; direction: Direction; size: Size }>`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme, size }) => {
    switch (size) {
      case 'tiny':
        return theme.spacing['0_5'];
      case 'small':
        return theme.spacing['1'];
      case 'medium':
        return theme.spacing['2'];
      case 'large':
        return theme.spacing['3'];
      case 'huge':
        return theme.spacing['4'];
    }
  }};

  ${({ isGrouped, direction, theme }) => {
    if (isGrouped) {
      if (direction === 'vertical') {
        return `
          &:not(:last-child) {
            border-bottom: 1px solid ${theme.colors.secondary};
          }
          &:first-child {
            border-top-left-radius: ${theme.borderRadius.medium};
            border-top-right-radius: ${theme.borderRadius.medium};
          }
          &:last-child {
            border-bottom-left-radius: ${theme.borderRadius.medium};
            border-bottom-right-radius: ${theme.borderRadius.medium};
          }
        `;
      } else {
        return `
          &:not(:last-child) {
            border-right: 1px solid ${theme.colors.secondary};
          }
          &:first-child {
            border-top-left-radius: ${theme.borderRadius.medium};
            border-bottom-left-radius: ${theme.borderRadius.medium};
          }
          &:last-child {
            border-top-right-radius: ${theme.borderRadius.medium};
            border-bottom-right-radius: ${theme.borderRadius.medium};
          }
        `;
      }
    } else {
      return `
        border-radius: ${theme.borderRadius.medium};
        border: 1px solid ${theme.colors.secondary};
      `;
    }
  }};

  dt {
    font-size: ${({ theme, size }) => {
      switch (size) {
        case 'tiny':
          return theme.fontSize.tiny;
        case 'small':
          return theme.fontSize.small;
        case 'medium':
          return theme.fontSize.medium;
        case 'large':
          return theme.fontSize.mediumLarge;
        case 'huge':
          return theme.fontSize.large;
      }
    }};
    color: ${({ theme }) => theme.colors.textAlt};
    margin-bottom: ${({ theme }) => theme.spacing['0_5']};
  }

  dd {
    font-weight: bold;
    color: ${({ theme }) => theme.colors.white};
    font-size: ${({ theme, size }) => {
      switch (size) {
        case 'tiny':
          return theme.fontSize.small;
        case 'small':
          return theme.fontSize.medium;
        case 'medium':
          return theme.fontSize.mediumLarge;
        case 'large':
          return theme.fontSize.large;
        case 'huge':
          return theme.fontSize.huge;
      }
    }};
    color: ${({ theme }) => theme.colors.text};
    font-size: ${({ theme }) => theme.fontSize.mediumLarge};
    letter-spacing: 1px;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing['1']};

    &.placeholder {
      min-width: 80%;
      min-height: 25px;
    }
  }
`;

const TrendContainer = styled.span<{ direction: 'up' | 'down' }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing['0_5']};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: normal;
  color: ${({ theme, direction }) => (direction === 'up' ? theme.colors.success : theme.colors.error)};
`;

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  margin-right: ${({ theme }) => theme.spacing['0_5']};
`;

export interface TrendConfig {
  direction: 'up' | 'down';
  value: string | number;
}

export interface StatProps {
  description: string;
  value: string | number | ReactNode;
  icon?: ReactNode;
  trend?: TrendConfig;
  isLoading?: boolean;
  size?: Size;
}

export const Stat: FC<StatProps> = ({ description, value, icon, trend, isLoading, size: propSize }) => {
  const { grouped, direction, size: contextSize } = useContext(StatContext);
  const size = propSize ?? contextSize;

  const renderValue = () => {
    if (typeof value === 'string' || typeof value === 'number') {
      return value.toString();
    }
    return value;
  };

  const renderIcon = () => {
    if (!icon) return null;
    if (isValidElement(icon)) {
      return <IconWrapper>{cloneElement(icon, { size: 20 } as any)}</IconWrapper>;
    }
    return <IconWrapper>{icon}</IconWrapper>;
  };

  const renderTrend = () => {
    if (!trend) return null;
    const TrendIcon = trend.direction === 'up' ? AiOutlineArrowUp : AiOutlineArrowDown;
    return (
      <TrendContainer direction={trend.direction}>
        <TrendIcon size={14} />
        {trend.value}
      </TrendContainer>
    );
  };

  if (isLoading) {
    return (
      <Container isGrouped={grouped} direction={direction} size={size} aria-busy="true" aria-label="Loading">
        <dt>{description}</dt>
        <dd className="placeholder"></dd>
      </Container>
    );
  }

  return (
    <Container isGrouped={grouped} direction={direction} size={size}>
      <dt>{description}</dt>
      <dd>
        {renderIcon()}
        {renderValue()}
        {renderTrend()}
      </dd>
    </Container>
  );
};
