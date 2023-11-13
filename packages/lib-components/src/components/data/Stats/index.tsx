import { FC, PropsWithChildren, Children, isValidElement } from 'react';
import { styled } from '../../../styled';
import { Stat } from './Stat';
import { StatContext, Direction } from './context';

export const Container = styled.dl<{ direction: Direction; border: boolean; count: number }>`
  display: grid;
  ${({ direction, count }) => {
    return direction === 'horizontal'
      ? `grid-template-columns: repeat(${count},1fr)`
      : `grid-template-rows: repeat(${count},1fr)`;
  }};
  border: ${({ border, theme }) => (border ? `1px solid ${theme.colors.secondary}` : 'none')};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  gap: ${({ theme, border }) => (border ? 0 : theme.spacing['2'])};
`;

export interface StatsProps {
  direction?: Direction;
  border: boolean;
}

interface SubComponents {
  Stat: typeof Stat;
}

export const Stats: FC<PropsWithChildren<StatsProps>> & SubComponents = ({
  direction = 'vertical',
  border,
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
    <Container direction={direction} border={border} count={Children.count(children)}>
      <StatContext.Provider value={{ border, direction }}>{children}</StatContext.Provider>
    </Container>
  );
};

Stats.Stat = Stat;
