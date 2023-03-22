import { FC, PropsWithChildren } from 'react';
import { styled } from '../../../styled';

export const Container = styled.div`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[2]};
  background-color: ${({ theme }) => theme.colors.background};
`;

export const DrawerFooter: FC<PropsWithChildren> = ({ children }) => {
  return <Container>{children}</Container>;
};
