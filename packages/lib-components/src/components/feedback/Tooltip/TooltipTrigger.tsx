import { HTMLProps, forwardRef, isValidElement, cloneElement } from 'react';
import { useTooltipContext } from './TooltipContext';
import { useMergeRefs } from '@floating-ui/react';
import { styled } from '../../../styled';

const Container = styled.div<{ isOpen: boolean }>`
  width: fit-content;
`;

interface TooltipTriggerProps {
  asChild?: boolean;
}

export const TooltipTrigger = forwardRef<HTMLElement, HTMLProps<HTMLElement> & TooltipTriggerProps>(
  ({ children, asChild = false, ...props }, propRef) => {
    const context = useTooltipContext();
    const childrenRef = (children as any).ref;
    const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

    // `asChild` allows the user to pass any element as the anchor
    if (asChild && isValidElement(children)) {
      return cloneElement(
        children,
        context.getReferenceProps({
          ref,
          ...props,
          ...children.props,

          // TODO: not sure how to handle this with styled-components
          'data-state': context.open ? 'open' : 'closed',
        })
      );
    }

    return (
      <Container ref={ref} isOpen={context.open} {...context.getReferenceProps(props)}>
        {children}
      </Container>
    );
  }
);
