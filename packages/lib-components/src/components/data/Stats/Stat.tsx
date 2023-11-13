import { FC, useContext } from 'react';
import { styled } from '../../../styled';
import { StatContext, Direction } from './context';

const Container = styled.div<{ hasBorder: boolean; direction: Direction }>`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => theme.spacing['2']};

  ${({ hasBorder, direction, theme }) => {
    if (hasBorder) {
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
      } else if (direction === 'horizontal') {
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
    font-size: ${({ theme }) => theme.fontSize.medium};
  }

  dd {
    font-weight: bold;
    color: ${({ theme }) => theme.colors.white};
    font-size: ${({ theme }) => theme.fontSize.mediumLarge};
    letter-spacing: 1px;
    margin: 0;
    padding: 0;
  }
`;

export interface StatProps {
  description: string;
  value: string;
  // TODO: Add icon support when needed
  // icon?: ReactNode
}

export const Stat: FC<StatProps> = ({ description, value }) => {
  const { border, direction } = useContext(StatContext);

  return (
    <Container hasBorder={border} direction={direction}>
      <div>
        <dt>{description}</dt>
        <dd>{value}</dd>
      </div>
    </Container>
  );
};
