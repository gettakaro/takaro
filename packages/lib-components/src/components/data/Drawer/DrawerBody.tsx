import { FC, PropsWithChildren, useId, useLayoutEffect } from 'react';
import { useDrawerContext } from './DrawerContext';
import { styled } from '../../../styled';

const Container = styled.div`
  position: relative;
  /* Large left padding is for the drawer handle */
  padding: ${({ theme }) => `0 ${theme.spacing['2_5']} ${theme.spacing[2]} ${theme.spacing['4']}`};
`;

export const DrawerBody: FC<PropsWithChildren> = ({ children }) => {
  const { setLabelId } = useDrawerContext();
  const id = useId();

  useLayoutEffect(() => {
    setLabelId(id);
    return () => setLabelId(undefined);
  }, [id, setLabelId]);

  return <Container>{children}</Container>;
};
