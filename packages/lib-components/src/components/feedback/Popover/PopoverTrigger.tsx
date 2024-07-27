import { forwardRef, cloneElement, isValidElement, HTMLProps, PropsWithChildren } from 'react';
import { usePopoverContext } from './PopoverContext';
import { useMergeRefs } from '@floating-ui/react';
import { ReactNode } from '@tanstack/react-router';

export type PopoverTriggerProps = HTMLProps<HTMLElement> &
  PropsWithChildren<{
    asChild?: boolean;
  }>;

export const PopoverTrigger = forwardRef<HTMLElement, PopoverTriggerProps>(
  ({ children, asChild = false, ...props }, propRef) => {
    const context = usePopoverContext();
    const childrenRef = (children as ReactNode).ref;
    const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

    // `asChild` allows the user to pass any element as the anchor
    if (asChild && isValidElement(children)) {
      return cloneElement(
        children,
        context.getReferenceProps({
          ref,
          ...props,
          ...children.props,
          'data-state': context.open ? 'open' : 'closed',
          onFocus: props.onFocus,
          onBlur: props.onBlur,
        }),
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        // The user can style the trigger based on the state
        data-state={context.open ? 'open' : 'closed'}
        {...context.getReferenceProps(props)}
      >
        {children}
      </button>
    );
  },
);
