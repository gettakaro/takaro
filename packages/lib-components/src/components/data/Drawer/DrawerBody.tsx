import { FC, PropsWithChildren, useId, useLayoutEffect } from 'react';
import { useDrawerContext } from './DrawerContext';
import { styled } from '../../../styled';
import SimpleBar from 'simplebar-react';

const Container = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing[2]};
`;

export const DrawerBody: FC<PropsWithChildren> = ({ children }) => {
  const { setLabelId } = useDrawerContext();
  const id = useId();

  useLayoutEffect(() => {
    setLabelId(id);
    return () => setLabelId(undefined);
  }, [id, setLabelId]);

  return (
    <SimpleBar style={{ maxHeight: '100%' }}>
      <Container>starts here{children} ends here</Container>
    </SimpleBar>
  );
};
