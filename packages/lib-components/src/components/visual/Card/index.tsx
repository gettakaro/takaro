import { forwardRef, HTMLProps, PropsWithChildren } from 'react';
import { styled } from '../../../styled';
import { CardTitle } from './CardTitle';
import { CardBody } from './CardBody';

type Variant = 'default' | 'outline';

const Container = styled.div<{ canClick: boolean; variant: Variant }>`
  border-radius: ${({ theme }) => theme.borderRadius.large};
  background-color: ${({ theme, variant }) =>
    variant === 'outline' ? theme.colors.background : theme.colors.backgroundAlt};
  border: 0.1rem solid ${({ theme }) => theme.colors.backgroundAccent};
  cursor: ${({ canClick }) => (canClick ? 'pointer' : 'default')};
  height: fit-content;

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

interface SubComponentTypes {
  Title: typeof CardTitle;
  Body: typeof CardBody;
}

export const _Card = forwardRef<HTMLDivElement, PropsWithChildren<CardProps>>(function Card(
  { children, variant = 'default', ...props },
  ref,
) {
  const canClick = 'onClick' in props;
  const { className, ...restProps } = props;

  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <Container ref={ref} canClick={canClick} variant={variant} className={className} {...restProps}>
      {children}
    </Container>
  );
});

// TODO: type it correctly instead
type CardType = typeof _Card & SubComponentTypes;
export const Card = _Card as CardType;

Card.Title = CardTitle;
Card.Body = CardBody;
