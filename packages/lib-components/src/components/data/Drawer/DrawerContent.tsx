import { styled } from '../../../styled';
import { getTransition } from '../../../helpers';
import { motion } from 'framer-motion';
import SimpleBar from 'simplebar-react';

import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useMergeRefs,
} from '@floating-ui/react';
import { forwardRef } from 'react';
import { useDrawerContext } from './DrawerContext';

const StyledFloatingOverlay = styled(FloatingOverlay)`
  background: rgba(0, 0, 0, 0.8);
  display: grid;
  place-items: end;
  max-height: 100vh;
  max-width: 100vw;
  overflow: hidden !important;
`;

const Container = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background};
  width: 460px;
  height: 100vh;
  max-height: 100vh;
  min-height: 100%;
`;

export const DrawerContent = forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>((props, propRef) => {
  const { context, labelId, descriptionId, getFloatingProps } =
    useDrawerContext();
  const ref = useMergeRefs([context.refs.setFloating, propRef]);

  const root = document.getElementById('drawer');
  if (!root) {
    throw new Error('Drawer need to render in a <div id="drawer"></div>');
  }

  return (
    <FloatingPortal root={root}>
      {context.open && (
        <StyledFloatingOverlay lockScroll>
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
              transition={getTransition()}
            >
              <SimpleBar style={{ maxHeight: '92vh' }}>
                {props.children}
              </SimpleBar>
            </Container>
          </FloatingFocusManager>
        </StyledFloatingOverlay>
      )}
    </FloatingPortal>
  );
});
