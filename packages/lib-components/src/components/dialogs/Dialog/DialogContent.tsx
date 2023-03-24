import { styled } from '../../../styled';
import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useMergeRefs,
} from '@floating-ui/react';
import { forwardRef } from 'react';
import { useDialogContext } from './DialogContext';
import SimpleBar from 'simplebar-react';

const StyledFloatingOverlay = styled(FloatingOverlay)`
  background: rgba(0, 0, 0, 0.8);
  display: grid;
  place-items: center;
`;

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: 15px;
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.elevation[4]};
  margin: 15px;
  min-width: 300px;
`;

export const DialogContent = forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>((props, propRef) => {
  const { context: floatingContext, ...context } = useDialogContext();
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
            >
              <SimpleBar>{props.children}</SimpleBar>
            </Container>
          </FloatingFocusManager>
        </StyledFloatingOverlay>
      )}
    </FloatingPortal>
  );
});
