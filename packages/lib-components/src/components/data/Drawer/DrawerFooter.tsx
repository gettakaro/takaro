import { FC, PropsWithChildren } from 'react';
import { styled } from '../../../styled';

export const Container = styled.div`
  width: 100%;
  position: fixed;
  bottom: 0;

  padding: ${({ theme }) => theme.spacing[2]};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
`;

export const DrawerFooter: FC<PropsWithChildren> = ({ children }) => {
  return <Container>{children}</Container>;
};
