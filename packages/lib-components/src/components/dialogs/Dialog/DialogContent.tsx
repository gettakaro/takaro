import { styled } from '../../../styled';
import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useMergeRefs,
} from '@floating-ui/react';
import { forwardRef } from 'react';
import { useDialogContext } from './DialogContext';

const StyledFloatingOverlay = styled(FloatingOverlay)`
  background: rgba(0, 0, 0, 0.8);
  display: grid;
  place-items: center;
`;

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing['1_5']};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme }) => theme.elevation[4]};
  margin: ${({ theme }) => theme.spacing['1_5']};
  min-width: 300px;
  border: 1px solid ${({ theme }) => theme.colors.backgroundAlt};
`;

export const DialogContent = forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>((props, propRef) => {
  const { context: floatingContext, ...context } = useDialogContext();
  const ref = useMergeRefs([context.refs.setFloating, propRef]);

  const root = document.getElementById('dialog');
  if (!root) {
    throw new Error('Dialog need to render in a <div id="dialog"></div>');
  }

  return (
    <FloatingPortal root={root}>
      {context.open && (
        <StyledFloatingOverlay lockScroll>
          <FloatingFocusManager context={floatingContext}>
            <Container
              ref={ref}
              aria-labelledby={context.labelId}
              aria-describedby={context.descriptionId}
              {...context.getFloatingProps(props)}
            >
              {props.children}
            </Container>
          </FloatingFocusManager>
        </StyledFloatingOverlay>
      )}
    </FloatingPortal>
  );
});
