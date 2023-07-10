import { forwardRef, cloneElement, isValidElement, HTMLProps, PropsWithChildren } from 'react';
import { useDropdownContext } from './DropdownContext';
import { useMergeRefs } from '@floating-ui/react';

export type DropdownTriggerProps = HTMLProps<HTMLElement> &
  PropsWithChildren<{
    asChild?: boolean;
  }>;

export const DropdownTrigger = forwardRef<HTMLElement, DropdownTriggerProps>(
  ({ children, asChild = false, ...props }, propRef) => {
    const context = useDropdownContext();
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
          onClick(event) {
            event.stopPropagation();
          },
        })
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        // The user can style the trigger based on the state
        {...context.getReferenceProps({
          ...props,
          ref,
          onClick(event) {
            event.stopPropagation();
          },
        })}
      >
        {children}
      </button>
    );
  }
);
