import { forwardRef, PropsWithChildren } from 'react';
import { pulseAnimation, styled } from '../../../styled';
import { AlertVariants, Color } from '../../../styled';
import { shade } from 'polished';

type ColorVariant = AlertVariants | Color | 'default';

const Container = styled.div<{ variant: ColorVariant; animate: boolean }>`
  background-color: ${({ theme, variant }) =>
    variant === 'default' ? theme.colors.background : shade('0.8', theme.colors[variant])};
  color: ${({ theme, variant }) => (variant === 'default' ? theme.colors.text : theme.colors[variant])};
  font-size: ${({ theme }) => theme.fontSize.tiny};
  font-weight: 600;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  width: fit-content;
  height: 1.5rem;
  line-height: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: -${({ theme }) => theme.spacing['1']};
  right: -${({ theme }) => theme.spacing['0_75']};
  padding: ${({ theme }) => theme.spacing['0_25']};
  border: 1px solid
    ${({ theme, variant }) => (variant === 'default' ? theme.colors.backgroundAccent : theme.colors[variant])};

  animation: ${({ animate, variant, theme }) =>
      animate ? pulseAnimation(variant === 'default' ? theme.colors.backgroundAccent : theme.colors[variant]) : 'none'}
    5s infinite ease-in-out;
`;

export interface BadgeProps {
  variant?: ColorVariant;
  animate?: boolean;
}

export const Badge = forwardRef<HTMLDivElement, PropsWithChildren<BadgeProps>>(function Badge(
  { variant = 'default', children, animate = false },
  ref,
) {
  return (
    <Container ref={ref} variant={variant} animate={animate}>
      {children}
    </Container>
  );
});
