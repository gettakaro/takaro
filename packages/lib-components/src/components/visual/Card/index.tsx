import { FC, HTMLProps, PropsWithChildren } from 'react';
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

export const Card: FC<PropsWithChildren<CardProps>> & SubComponentTypes = function Card({
  children,
  variant = 'default',
  ...props
}) {
  const canClick = 'onClick' in props;
  const { className, ...restProps } = props;

  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <Container canClick={canClick} variant={variant} className={className} {...restProps}>
      {children}
    </Container>
  );
};

Card.Title = CardTitle;
Card.Body = CardBody;
