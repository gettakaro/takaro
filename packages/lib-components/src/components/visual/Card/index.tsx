import { PropsWithChildren, forwardRef } from 'react';
import { styled } from '../../../styled';

type Variant = 'default' | 'outline';

const Container = styled.div<{ canClick: boolean; variant: Variant }>`
  border-radius: ${({ theme }) => theme.borderRadius.large};
  background-color: ${({ theme, variant }) =>
    variant === 'outline' ? theme.colors.background : theme.colors.backgroundAlt};
  border: 0.1rem solid ${({ theme }) => theme.colors.backgroundAccent};
  padding: ${({ theme }) => theme.spacing[2]};
  cursor: ${({ canClick }) => (canClick ? 'pointer' : 'default')};

  &:focus-within {
    border-color: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:active {
    border-color: ${({ theme, canClick }) => (canClick ? theme.colors.primary : theme.colors.backgroundAccent)};
  }
`;

export interface CardProps {
  onClick?: (e: React.MouseEvent) => unknown;
  variant?: Variant;
}

export const Card = forwardRef<HTMLDivElement, PropsWithChildren<CardProps>>(
  ({ children, onClick, variant = 'default' }, ref) => {
    return (
      <Container ref={ref} onClick={onClick} canClick={onClick ? true : false} variant={variant}>
        {children}
      </Container>
    );
  }
);
