import { forwardRef, HTMLProps, useId, useLayoutEffect } from 'react';
import { useDrawerContext } from './DrawerContext';
import { AiOutlineClose as CloseIcon } from 'react-icons/ai';
import { styled } from '../../../styled';
import { Tooltip } from '../../../components';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing['2_5']} 0;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

interface DialogHeadingProps extends HTMLProps<HTMLHeadingElement> {
  hasClose?: boolean;
}

export const DrawerHeading = forwardRef<HTMLHeadingElement, DialogHeadingProps>(
  ({ children, hasClose = true, ...props }, ref) => {
    const { setLabelId, setOpen } = useDrawerContext();
    const id = useId();

    useLayoutEffect(() => {
      setLabelId(id);
      return () => setLabelId(undefined);
    }, [id, setLabelId]);

    return (
      <Container>
        <h3 {...props} ref={ref} id={id}>
          {children}
        </h3>
        {hasClose && (
          <Tooltip label="Close drawer">
            <CloseIcon
              size={18}
              onClick={() => setOpen(false)}
              cursor="pointer"
            />
          </Tooltip>
        )}
      </Container>
    );
  }
);
