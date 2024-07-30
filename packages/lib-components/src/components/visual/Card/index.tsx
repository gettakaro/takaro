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

  &:focus {
    border-color: ${({ theme, canClick }) => (canClick ? theme.colors.primary : theme.colors.backgroundAccent)};
  }

  &:active {
    border-color: ${({ theme, canClick }) => (canClick ? theme.colors.primary : theme.colors.backgroundAccent)};
  }

  overflow: hidden; /* Ensure the container hides content overflow */
`;

// Extend HTMLProps for standard HTML attributes and add custom props
export interface CardProps extends HTMLProps<HTMLDivElement> {
  variant?: Variant;
}

// Forward ref and spread all props to the Container
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { children, variant = 'default', ...props },
  ref,
) {
  const canClick = 'onClick' in props;

  // Extract the className prop, if present
  const { className, ...restProps } = props;

  return (
    // TODO: type this properly
    //eslint-disable-next-line
    //@ts-ignore
    <Container ref={ref} canClick={canClick} variant={variant} className={className} {...restProps}>
      {children}
    </Container>
  );
});
