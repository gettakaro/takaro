import { forwardRef, HTMLProps, useState } from 'react';
import { styled } from '../../../styled';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import SimpleBar from 'simplebar-react';

import { FloatingFocusManager, FloatingOverlay, FloatingPortal, useMergeRefs } from '@floating-ui/react';
import { useDrawerContext } from './DrawerContext';

const StyledFloatingOverlay = styled(FloatingOverlay)<{ dragIndex: number }>`
  background: rgba(0, 0, 0, ${({ dragIndex }) => Math.max(0.8 - dragIndex, 0.4)});
  display: grid;
  place-items: end;
  max-height: 100vh;
  max-width: 100vw;
  overflow: hidden !important;
`;

const Container = styled(motion.div)`
  position: relative;
  background-color: ${({ theme }) => theme.colors.background};
  width: 700px;
  height: 100%;
  z-index: ${({ theme }) => theme.zIndex.drawer};
  border-left: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
`;

export const HandleContainer = styled.div`
  height: 80vh;
  top: 10vh;
  width: 15px;
  left: 5px;
  display: flex;
  align-items: center;
  position: absolute;
  justify-content: center;

  /* handle */
  div {
    background-color: ${({ theme }) => theme.colors.backgroundAccent};
    height: 100px;
    width: 0.8rem;
    border-radius: 9999px;
  }
`;

export const DrawerContent = forwardRef<HTMLElement, HTMLProps<HTMLDivElement>>((props, propRef) => {
  const { context, labelId, descriptionId, getFloatingProps, setOpen } = useDrawerContext();

  const ref = useMergeRefs([context.refs.setFloating, propRef]);
  const [dragPosition, setDragPosition] = useState<number>(0);

  const root = document.getElementById('drawer');
  if (!root) {
    throw new Error('Drawer needs to render in a <div id="drawer"></div>');
  }

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // This prevents the drawer from being dragged more than its width to the left
    if (info.point.x < -700) {
      setDragPosition(-700);
    } else {
      const newPosition = Math.min(Math.max(info.offset.x / 650, 0), 1);
      setDragPosition(newPosition);
    }
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Snap back to position if dragged to the right
    if (info.offset.x > 450) {
      setOpen(false);
    } else if (info.point.x >= 0) {
      setDragPosition(0);
    }
  };

  return (
    <FloatingPortal root={root}>
      <AnimatePresence>
        {context.open && (
          <StyledFloatingOverlay lockScroll dragIndex={dragPosition}>
            <FloatingFocusManager context={context}>
              <Container
                ref={ref}
                aria-labelledby={labelId}
                aria-describedby={descriptionId}
                {...getFloatingProps(props)}
                initial={{ x: '100%' }}
                animate={{
                  x: 0,
                }}
                exit={{
                  x: '100%',
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                dragElastic={0.5}
                layout
              >
                <HandleContainer>
                  <div />
                </HandleContainer>
                <SimpleBar style={{ maxHeight: '92vh' }}>{props.children}</SimpleBar>
              </Container>
            </FloatingFocusManager>
          </StyledFloatingOverlay>
        )}
      </AnimatePresence>
    </FloatingPortal>
  );
});
