import { forwardRef, HTMLProps, useState } from 'react';
import { styled } from '../../../styled';
import { Button } from '../../../components';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import SimpleBar from 'simplebar-react';

import { FloatingFocusManager, FloatingPortal, useMergeRefs, FloatingOverlay } from '@floating-ui/react';
import { useDrawerContext } from './DrawerContext';

const Container = styled(motion.div)`
  position: relative;
  background-color: ${({ theme }) => theme.colors.background};
  width: 700px;
  height: 100%;
  z-index: ${({ theme }) => theme.zIndex.drawer};
  border-left: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const CloseConfirmationWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
`;

const CloseConfirmationContainer = styled.div`
  height: 150px;
  padding: ${({ theme }) => theme.spacing[2]};
  width: calc(100% - 200px);
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  h2,
  p {
    margin-bottom: ${({ theme }) => theme.spacing[1]};
  }
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

export const DrawerContent = forwardRef<HTMLElement, HTMLProps<HTMLDivElement>>(function DrawerContent(props, propRef) {
  const {
    context,
    labelId,
    descriptionId,
    getFloatingProps,
    setOpen,
    canDrag,
    showConfirmDialog,
    setShowConfirmDialog,
  } = useDrawerContext();

  const ref = useMergeRefs([context.refs.setFloating, propRef]);
  const [dragPosition, setDragPosition] = useState<number>(0);

  const root = document.getElementById('drawer');
  if (!root) {
    throw new Error('Drawer needs to render in a <div id="drawer"></div>');
  }

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const newPosition = Math.min(Math.max(info.offset.x / 650, 0), 1);
    setDragPosition(newPosition);
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Snap back to position if dragged to the right
    if (info.offset.x > 450) {
      setOpen(false);
    } else if (info.offset.x >= 0) {
      setDragPosition(0);
    }
  };

  return (
    <FloatingPortal root={root}>
      <AnimatePresence>
        {context.open && (
          <FloatingOverlay
            lockScroll
            style={{
              placeItems: 'end',
              maxHeight: '100vh',
              maxWidth: '100vw',
              overflow: 'hidden!important',
              display: 'grid',
              background: `rgba(0, 0, 0, ${Math.max(0.8 - dragPosition, 0.4)})`,
            }}
          >
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
                drag={canDrag ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                dragElastic={{ left: 0, right: 0.4 }}
                layout
              >
                {canDrag && (
                  <HandleContainer>
                    <div />
                  </HandleContainer>
                )}
                <SimpleBar style={{ maxHeight: '92vh' }}>{props.children}</SimpleBar>
                {showConfirmDialog && (
                  <CloseConfirmationWrapper>
                    <CloseConfirmationContainer>
                      <h2>Your progress will be lost</h2>
                      <p>Are you sure you want to exit? Your progress will not be saved.</p>
                      <ButtonContainer>
                        <Button color="secondary" onClick={() => setShowConfirmDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setOpen(false)} color="error">
                          Discard changes
                        </Button>
                      </ButtonContainer>
                    </CloseConfirmationContainer>
                  </CloseConfirmationWrapper>
                )}
              </Container>
            </FloatingFocusManager>
          </FloatingOverlay>
        )}
      </AnimatePresence>
    </FloatingPortal>
  );
});
