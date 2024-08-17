import { forwardRef, HTMLProps } from 'react';
import { useMergeRefs, FloatingPortal, FloatingFocusManager, FloatingArrow } from '@floating-ui/react';
import { usePopoverContext } from './PopoverContext';
import { styled } from '../../../styled';
import { useTheme } from '../../../hooks';

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border: 0.1rem solid ${({ theme }) => theme.colors.backgroundAccent};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
`;

export const PopoverContent = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(function PopoverContent(
  { style, ...props },
  propRef,
) {
  const theme = useTheme();
  const { context: floatingContext, arrowRef, ...context } = usePopoverContext();
  const ref = useMergeRefs([context.refs.setFloating, propRef]);

  if (!floatingContext.open) return null;

  return (
    <FloatingPortal>
      <FloatingFocusManager context={floatingContext} modal={context.modal}>
        <Container
          ref={ref}
          style={{ ...context.floatingStyles, ...style }}
          aria-labelledby={context.labelId}
          aria-describedby={context.descriptionId}
          {...context.getFloatingProps(props)}
        >
          {props.children}
          <FloatingArrow
            ref={arrowRef}
            context={floatingContext}
            fill={theme.colors.background}
            stroke={theme.colors.backgroundAccent}
            style={{ transform: 'translateY(-1px)' }}
            strokeWidth={1}
          />
        </Container>
      </FloatingFocusManager>
    </FloatingPortal>
  );
});
