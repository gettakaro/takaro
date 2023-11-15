import { styled } from '../../../styled';

export const Container = styled.div<{
  isOpen: boolean;
  hasError: boolean;
}>`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justyfy-content: flex-start;
  text-align: left;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  width: fit-content;
  font-family: inherit;
  outline: 0;
  font-weight: 500;
  text-transform: capitalize;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border: 0.1rem solid
    ${({ theme, isOpen, hasError }) => {
      if (hasError) return theme.colors.error;
      return isOpen ? theme.colors.primary : theme.colors.background;
    }};

  &:focus {
    border-color: ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.primary)};
  }
  flex-shrink: 0;
`;

export const ItemContainer = styled.div<{ readOnly: boolean }>`
  cursor: ${({ readOnly }) => (readOnly ? 'default' : 'pointer')};
  padding: ${({ theme }) => `${theme.spacing['0_75']}`};
`;

export const QuickSelectContainer = styled.div<{ readOnly: boolean }>`
  border-radius: ${({ theme }) => `${theme.borderRadius.medium} 0 0 ${theme.borderRadius.medium};`};
  height: 100%;
  cursor: ${({ readOnly }) => (readOnly ? 'default' : 'pointer')};
  gap: ${({ theme }) => theme.spacing['0_25']};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => `0 ${theme.spacing['0_75']}`};
  background-color: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
`;
