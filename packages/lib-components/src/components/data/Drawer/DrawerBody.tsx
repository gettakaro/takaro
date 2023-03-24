import { FC, PropsWithChildren, useId, useLayoutEffect } from 'react';
import { useDrawerContext } from './DrawerContext';
import { styled } from '../../../styled';

const Container = styled.div`
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing['2_5']}`};
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
