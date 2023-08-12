import { styled } from '../../../styled';

export const Container = styled.div<{
  isOpen: boolean;
  hasError: boolean;
}>`
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
  padding: ${({ theme }) => `0 ${theme.spacing['0_5']}`};
  border: 0.1rem solid
    ${({ theme, isOpen, hasError }) => {
      if (hasError) return theme.colors.error;
      return isOpen ? theme.colors.primary : theme.colors.background;
    }};

  &:focus {
    border-color: ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.primary)};
  }
`;

export const ItemContainer = styled.div<{ readOnly: boolean }>`
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing['0_5']}`};
  cursor: ${({ readOnly }) => (readOnly ? 'default' : 'pointer')};
`;

export const QuickSelectContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: ${({ theme }) => theme.spacing['0_5']};
`;
