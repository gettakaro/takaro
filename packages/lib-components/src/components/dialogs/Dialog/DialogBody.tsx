import { forwardRef, PropsWithChildren, useId, useLayoutEffect } from 'react';
import { useDialogContext } from './DialogContext';
import { Size, styled } from '../../../styled';

const Container = styled.div<{ size: Size }>`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  width: 100%;
  min-width: 350px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing[4]};

  & > p {
    margin-bottom: ${({ theme }) => theme.spacing[2]};
  }

  ${({ size, theme }) => {
    switch (size) {
      case 'tiny':
      case 'small':
        return `
            max-width: 450px;
            padding: ${theme.spacing[2]};
          `;
      case 'medium':
        return `
          max-width: 500px;
          padding: ${theme.spacing[3]};
         `;
      case 'large':
      case 'huge':
        return `
          max-width: 600px;
          padding: ${theme.spacing[4]};
          `;
    }
  }};
`;

export interface DialogBodyProps {
  size?: Size;
}

export const DialogBody = forwardRef<HTMLParagraphElement, PropsWithChildren<DialogBodyProps>>(function DialogBody(
  { children, size = 'medium', ...props },
  ref,
) {
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
