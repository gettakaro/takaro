import { forwardRef, PropsWithChildren, useId, useLayoutEffect } from 'react';
import { useDialogContext } from './DialogContext';
import { Size, styled } from '../../../styled';

const Container = styled.div<{ size: Size }>`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  width: 100%;

  ${({ size }) => {
    switch (size) {
      case 'tiny':
      case 'small':
        return 'max-width: 370px';
      case 'medium':
        return 'max-width: 400px';
      case 'large':
      case 'huge':
        return 'max-width: 500px';
    }
  }};
`;

interface DialogBodyProps {
  size?: Size;
}

export const DialogBody = forwardRef<
  HTMLParagraphElement,
  PropsWithChildren<DialogBodyProps>
>(({ children, size = 'medium', ...props }, ref) => {
  const { setDescriptionId } = useDialogContext();
  const id = useId();

  // Only sets `aria-describedby` on the Dialog root element
  // if this component is mounted inside it.
  useLayoutEffect(() => {
    setDescriptionId(id);
    return () => setDescriptionId(undefined);
  }, [id, setDescriptionId]);

  return (
    <Container {...props} ref={ref} id={id} size={size}>
      {children}
    </Container>
  );
});
