import { FC, PropsWithChildren, Children, isValidElement } from 'react';
import { styled, Size } from '../../../styled';
import { Stat } from './Stat';
import { Sparkline } from './Sparkline';
import { StatContext, Direction } from './context';

export const Container = styled.dl<{ direction: Direction; grouped: boolean; count: number }>`
  display: grid;
  ${({ direction, count }) => {
    return direction === 'horizontal'
      ? `grid-template-columns: repeat(${count},1fr)`
      : `grid-template-rows: repeat(${count},1fr)`;
  }};
  border: ${({ grouped, theme }) => (grouped ? `1px solid ${theme.colors.secondary}` : 'none')};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  gap: ${({ theme, direction, grouped }) => {
    if (grouped) return 0;
    return direction === 'vertical' ? `${theme.spacing['2']} 0` : `0 ${theme.spacing['2']}`;
  }};
`;

export interface StatsProps {
  direction?: Direction;
  grouped: boolean;
  size?: Size;
}

interface SubComponents {
  Stat: typeof Stat;
  Sparkline: typeof Sparkline;
}

export const Stats: FC<PropsWithChildren<StatsProps>> & SubComponents = ({
  direction = 'vertical',
  grouped,
  size = 'medium',
  children,
}) => {
  // throw error if child is not a Stat component
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      return;
    }
    if (child.type !== Stat) {
      throw new Error(`Stats component only accepts Stat components as children. Received ${child.type} instead.`);
    }
  });

  return (
    <Container direction={direction} grouped={grouped} count={Children.count(children)}>
      <StatContext.Provider value={{ grouped, direction, size }}>{children}</StatContext.Provider>
    </Container>
  );
};

Stats.Stat = Stat;
Stats.Sparkline = Sparkline;

export type { Direction } from './context';
export type { Size } from '../../../styled';
export type { TrendConfig } from './Stat';
export type { SparklineProps } from './Sparkline';
