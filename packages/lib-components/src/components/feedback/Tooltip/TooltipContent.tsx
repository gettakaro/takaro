import { forwardRef, HTMLProps } from 'react';
import { useMergeRefs, FloatingPortal, FloatingArrow } from '@floating-ui/react';
import { useTooltipContext } from './TooltipContext';
import { Elevation, styled } from '../../../styled';
import { useTheme } from '../../../hooks';

const Container = styled.div<{ elevation: Elevation }>`
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  box-shadow: ${({ theme, elevation }) => theme.elevation[elevation]};
  pointer-events: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => `${theme.spacing['0_5']} ${theme.spacing['0_75']}`};
  font-size: 1.4rem;
  width: max-content;
  z-index: ${({ theme }) => theme.zIndex.tooltip};
`;

export const TooltipContent = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(function TooltipContent(
  { style, ...props },
  propRef,
) {
  const theme = useTheme();
  const { floatingStyles, open, arrowRef, context, getFloatingProps } = useTooltipContext();
  const ref = useMergeRefs([context.refs.setFloating, propRef]);

  if (!open) return null;

  return (
    <FloatingPortal>
      <Container
        elevation={1}
        ref={ref}
        style={{
          ...floatingStyles,
          ...style,
          border: `1px solid ${theme.colors.backgroundAccent}`,
        }}
        {...getFloatingProps(props)}
      >
        {props.children}
        <FloatingArrow
          ref={arrowRef}
          context={context}
          fill={theme.colors.background}
          stroke={theme.colors.backgroundAccent}
          strokeWidth={1}
        />
      </Container>
    </FloatingPortal>
  );
});
