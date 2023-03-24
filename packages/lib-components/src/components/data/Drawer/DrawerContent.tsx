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
  overflow-x: hidden !important;
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
  const { context: floatingContext, ...context } = useDrawerContext();
  const ref = useMergeRefs([context.refs.setFloating, propRef]);

  return (
    <FloatingPortal>
      {context.open && (
        <StyledFloatingOverlay lockScroll>
          <FloatingFocusManager context={floatingContext}>
            <Container
              ref={ref}
              aria-labelledby={context.labelId}
              aria-describedby={context.descriptionId}
              {...context.getFloatingProps(props)}
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
