import { styled } from '@takaro/lib-components';

export const ItemContent = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing['1']};
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

export const InputTypeContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.secondary};
  padding: ${({ theme }) => `${theme.spacing['0_5']} ${theme.spacing['1']}`};
`;

export const InputContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  width: 100%;
  height: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  position: relative;
  display: flex;
  flex-direction: row;
`;

export const Input = styled.input`
  padding-left: ${({ theme }) => theme.spacing['4']};
  padding-right: ${({ theme }) => theme.spacing['4']};
`;
export const PrefixContainer = styled.div`
  position: absolute;
  align-items: center;
  display: flex;
  bottom: 0;
  left: 12px;
  top: 0;
`;

export const SuffixContainer = styled.div`
  position: absolute;
  align-items: center;
  display: flex;
  bottom: 0;
  left: auto;
  right: 12px;
  top: 0;
  cursor: pointer;
`;
