import { FC, PropsWithChildren, useId, useLayoutEffect } from 'react';
import { useDrawerContext } from './DrawerContext';
import { styled } from '../../../styled';

const Container = styled.div<{ canDrag: boolean }>`
  position: relative;
  /* Large left padding is for the drawer handle */
  padding: ${({ theme, canDrag }) =>
    `0 ${theme.spacing['2_5']} ${theme.spacing[2]} ${canDrag ? theme.spacing['4'] : theme.spacing['2_5']}`};
`;

export const DrawerBody: FC<PropsWithChildren> = ({ children }) => {
  const { setLabelId, canDrag } = useDrawerContext();
  const id = useId();

  useLayoutEffect(() => {
    setLabelId(id);
    return () => setLabelId(undefined);
  }, [id, setLabelId]);

  return <Container canDrag={canDrag}>{children}</Container>;
};
