import { styled } from '../../../styled';
import { FloatingFocusManager, FloatingOverlay, FloatingPortal, useMergeRefs } from '@floating-ui/react';
import { Card } from '../../../components';
import { forwardRef } from 'react';
import { useDialogContext } from './DialogContext';

const StyledFloatingOverlay = styled(FloatingOverlay)`
  background: rgba(0, 0, 0, 0.8);
  display: grid;
  place-items: center;
`;

export const DialogContent = forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
  function DialogContent(props, propRef) {
    const { context: floatingContext, ...context } = useDialogContext();
    const ref = useMergeRefs([context.refs.setFloating, propRef]);

    const root = document.getElementById('dialog');
    if (!root) {
      throw new Error('Dialog need to render in a <div id="dialog"></div>');
    }

    return (
      <FloatingPortal root={root}>
        {context.open && (
          <StyledFloatingOverlay
            lockScroll
            onClick={(e) => {
              // Prevent clicks within dialog to bubble up to parent element with click event.
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <FloatingFocusManager context={floatingContext}>
              <Card
                ref={ref}
                aria-labelledby={context.labelId}
                aria-describedby={context.descriptionId}
                {...context.getFloatingProps({
                  ...props,
                })}
              >
                <Card.Body>{props.children}</Card.Body>
              </Card>
            </FloatingFocusManager>
          </StyledFloatingOverlay>
        )}
      </FloatingPortal>
    );
  },
);
