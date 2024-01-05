import { FC, PropsWithChildren } from 'react';
import { styled } from '../../../styled';

export const Container = styled.div`
  /* Should match width of drawercontent */
  width: calc(700px - 1px);
  position: fixed;
  bottom: 0;
  /* should be shown above the rest of drawer (this is relative to DrawerContent) */
  z-index: 1;
  border-top: 1px solid ${({ theme }) => theme.colors.backgroundAccent};

  padding: ${({ theme }) => theme.spacing[2]};
  background-color: ${({ theme }) => theme.colors.background};
`;

export const DrawerFooter: FC<PropsWithChildren> = ({ children }) => {
  return <Container>{children}</Container>;
};
