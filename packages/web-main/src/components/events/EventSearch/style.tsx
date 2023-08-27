import { styled } from '@takaro/lib-components';

export const ItemContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing['1']};
  padding: ${({ theme }) => `${theme.spacing['0_5']} ${theme.spacing['0_75']}`};
  user-select: none;
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

export const ItemList = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => `0 0 ${theme.borderRadius.medium} ${theme.borderRadius.medium}`};
  overflowy: 'auto';
`;

export const Wrapper = styled.div`
  width: 100%;
`;
