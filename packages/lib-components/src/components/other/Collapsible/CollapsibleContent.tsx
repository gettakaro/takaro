import { FC, PropsWithChildren } from 'react';
import { useCollapsibleContext } from './CollapsibleContext';
import { styled } from '../../../styled';

const Container = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing['1']};
  hyphens: auto;

  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  padding: 10px 5px 0px 5px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;

  p {
    hypens: auto;
  }
`;

export const CollapsibleContent: FC<PropsWithChildren> = ({ children }) => {
  const { open } = useCollapsibleContext();

  if (!open) {
    return null;
  }

  return <Container aria-expanded={open}>{children}</Container>;
};
