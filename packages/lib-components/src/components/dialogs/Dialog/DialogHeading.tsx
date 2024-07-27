import { forwardRef, HTMLProps, useId, useLayoutEffect } from 'react';
import { useDialogContext } from './DialogContext';
import { AiOutlineClose as CloseIcon } from 'react-icons/ai';
import { styled } from '../../../styled';
import { IconButton, Tooltip } from '../../../components';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  h4 {
    font-size: ${({ theme }) => theme.fontSize.tiny};
  }
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

interface DialogHeadingProps extends HTMLProps<HTMLHeadingElement> {
  hasClose?: boolean;
}

export const DialogHeading = forwardRef<HTMLHeadingElement, DialogHeadingProps>(function DialogHeading(
  { children, hasClose = true, ...props },
  ref,
) {
  const { setLabelId, setOpen } = useDialogContext();
  const id = useId();

  useLayoutEffect(() => {
    setLabelId(id);
    return () => setLabelId(undefined);
  }, [id, setLabelId]);

  return (
    <Container>
      <h4 {...props} ref={ref} id={id}>
        {children}
      </h4>
      {hasClose && (
        <Tooltip>
          <Tooltip.Trigger asChild>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
              ariaLabel="Close dialog"
              icon={<CloseIcon cursor="pointer" />}
            />
          </Tooltip.Trigger>
          <Tooltip.Content>Close dialog</Tooltip.Content>
        </Tooltip>
      )}
    </Container>
  );
});
