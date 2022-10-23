import { FC, cloneElement, useState, useMemo } from 'react';
import { styled } from '../../../styled';
import {
  Placement,
  offset,
  flip,
  shift,
  autoUpdate,
  useFloating,
  useInteractions,
  useHover,
  useFocus,
  useRole,
  useDismiss,
  useDelayGroupContext,
  useDelayGroup
} from '@floating-ui/react-dom-interactions';
import { AnimatePresence, motion } from 'framer-motion';
import { mergeRefs } from 'react-merge-refs';

export interface TooltipProps {
  label: string;
  placement?: Placement;
  children: JSX.Element;
}

const Container = styled(motion.div)`
  background: #222;
  color: white;
  pointer-events: none;
  border-radius: .6rem;
  padding: .4rem .6rem;
  font-size: 1.4rem;
  width: max-content;
  z-index: 100;
`;


export const Tooltip: FC<TooltipProps> = ({ children, label, placement = 'top' }) => {
  const { delay, setCurrentId } = useDelayGroupContext();
  const [open, setOpen] = useState(false);

  const { x, y, reference, floating, strategy, context } = useFloating({
    placement,
    open,
    onOpenChange(open) {
      setOpen(open);

      if (open) {
        setCurrentId(label);
      }
    },
    middleware: [offset(5), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { delay, restMs: 100 }),
    useFocus(context),
    useRole(context, { role: 'tooltip' }),
    useDismiss(context),
    useDelayGroup(context, { id: label })
  ]);

  // Preserve the consumer's ref
  const ref = useMemo(() => mergeRefs([reference, (children as any).ref]), [
    reference,
    children
  ]);

  return (
    <>
      {cloneElement(children, getReferenceProps({ ref, ...children.props }))}
      <AnimatePresence>
        {open && (
          <Container
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={
              // When in "grouped phase", make the transition faster
              // The open delay becomes 1ms during this phase.
              typeof delay === 'object' && delay.open === 1
                ? { duration: 0.1 }
                : { type: 'spring', damping: 20, stiffness: 300 }
            }
            layoutId="tooltip"
            ref={floating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0
            }}
            {...getFloatingProps()}
          >
            {label}
          </Container>
        )}
      </AnimatePresence>
    </>
  );
};

