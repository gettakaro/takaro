import { forwardRef, HTMLProps } from 'react';
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
    border-color: ${({ theme, canClick }) => (canClick ? theme.colors.primary : theme.colors.backgroundAccent)};
  }

  &:active {
    border-color: ${({ theme, canClick }) => (canClick ? theme.colors.primary : theme.colors.backgroundAccent)};
  }
`;

// Extend HTMLProps for standard HTML attributes and add custom props
export interface CardProps extends HTMLProps<HTMLDivElement> {
  variant?: Variant;
}

// Forward ref and spread all props to the Container
export const Card = forwardRef<HTMLDivElement, CardProps>(({ children, variant = 'default', ...props }, ref) => {
  const canClick = 'onClick' in props;

  return (
    <div {...props}>
      <Container ref={ref} canClick={canClick} variant={variant}>
        {children}
      </Container>
    </div>
  );
});
