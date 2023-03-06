import { FC, cloneElement, useState, useMemo } from 'react';
import { Elevation, styled } from '../../../styled';
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
  useDelayGroup,
} from '@floating-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { mergeRefs } from 'react-merge-refs';
import { useTheme } from '../../../hooks';

export interface TooltipProps {
  label: string;
  placement?: Placement;
  children: JSX.Element;
  elevation?: Elevation;
}

const Container = styled(motion.div)<{ elevation: Elevation }>`
  background: #222;
  color: white;
  box-shadow: ${({ theme, elevation }) => theme.elevation[elevation]};
  pointer-events: none;
  border-radius: 0.6rem;
  padding: ${({ theme }) => `${theme.spacing['0_5']} ${theme.spacing['0_75']}`};
  font-size: 1.4rem;
  width: max-content;
  z-index: 100;
`;

export const Tooltip: FC<TooltipProps> = ({
  children,
  label,
  placement = 'top',
  elevation = 1,
}) => {
  const { delay, setCurrentId } = useDelayGroupContext();
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const { x, y, reference, floating, strategy, context } = useFloating({
    placement,
    open,
    onOpenChange(open) {
      setOpen(open);

      if (open) {
        setCurrentId(label);
      }
    },
    middleware: [
      offset(5),
      flip(),
      shift({ padding: Number(theme.spacing[10].replace('rem', '')) }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { delay, restMs: 100 }),
    useFocus(context),
    useRole(context, { role: 'tooltip' }),
    useDismiss(context),
    useDelayGroup(context, { id: label }),
  ]);

  // Preserve the consumer's ref
  const ref = useMemo(
    () => mergeRefs([reference, (children as any).ref]),
    [reference, children]
  );

  return (
    <>
      {cloneElement(children, getReferenceProps({ ref, ...children.props }))}
      <AnimatePresence>
        {open && (
          <Container
            elevation={elevation}
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
              left: x ?? 0,
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
