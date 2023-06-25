import { forwardRef, HTMLProps } from 'react';
import { useMergeRefs, FloatingPortal } from '@floating-ui/react';
import { useTooltipContext } from './TooltipContext';
import { Elevation, styled } from '../../../styled';

const Container = styled.div<{ elevation: Elevation }>`
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  box-shadow: ${({ theme, elevation }) => theme.elevation[elevation]};
  pointer-events: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: ${({ theme }) => `${theme.spacing['0_5']} ${theme.spacing['0_75']}`};
  font-size: 1.4rem;
  width: max-content;
  z-index: ${({ theme }) => theme.zIndex.tooltip};
`;

export const TooltipContent = forwardRef<
  HTMLDivElement,
  HTMLProps<HTMLDivElement>
>(({ style, ...props }, propRef) => {
  const context = useTooltipContext();
  const ref = useMergeRefs([context.refs.setFloating, propRef]);

  if (!context.open) return null;

  return (
    <FloatingPortal>
      <Container
        elevation={1}
        ref={ref}
        style={{
          ...context.floatingStyles,
          ...style,
        }}
        {...context.getFloatingProps(props)}
      />
    </FloatingPortal>
  );
});
