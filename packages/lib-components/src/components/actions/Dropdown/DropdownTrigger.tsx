import { forwardRef, cloneElement, isValidElement, HTMLProps, useState, ReactElement, ReactNode, JSX } from 'react';
import { useDropdownContext } from './DropdownContext';
import { useMergeRefs } from '@floating-ui/react';
import { TooltipOptions } from '../../feedback/Tooltip/useTooltip';
import { Tooltip } from '../../../components';

export type DropdownTriggerProps = HTMLProps<HTMLElement> & {
  asChild?: boolean;
  tooltipOptions?: TooltipOptions & { content: ReactNode };
  children: JSX.Element | Array<JSX.Element>;
};

export const DropdownTrigger = forwardRef<HTMLElement, DropdownTriggerProps>(function DropdownTrigger(
  {
    children,
    asChild = false,
    tooltipOptions = {
      initialOpen: false,
      placement: 'top', // because dropdown will be below by default
    },
    ...props
  },
  propRef,
) {
  const context = useDropdownContext();
  const childrenRef = (children as any).ref;
  const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

  const [unControlledOpen, setUncontrolledOpen] = useState<boolean>(tooltipOptions?.initialOpen ?? false);

  const open = tooltipOptions.open ?? unControlledOpen;
  const setOpen = tooltipOptions.onOpenChange ?? setUncontrolledOpen;

  let inner: ReactElement;

  // `asChild` allows the user to pass any element as the anchor
  if (asChild && isValidElement(children)) {
    inner = cloneElement(
      children,
      context.getReferenceProps({
        ref,
        ...props,
        ...children.props,
        onClick(event) {
          event.stopPropagation();
        },
      }),
    );
  } else {
    inner = (
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

  if (tooltipOptions && tooltipOptions.content) {
    return (
      <Tooltip open={open} onOpenChange={setOpen} placement={tooltipOptions.placement}>
        <Tooltip.Trigger>{inner}</Tooltip.Trigger>
        <Tooltip.Content>{tooltipOptions.content}</Tooltip.Content>
      </Tooltip>
    );
  }

  return inner;
});
