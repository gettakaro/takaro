import { styled } from '../../../styled';

export const Container = styled.div<{
  readOnly: boolean;
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
  cursor: ${({ readOnly }) => (readOnly ? 'not-allowed' : 'pointer')};
  font-family: inherit;
  outline: 0;
  font-weight: 500;
  padding: ${({ theme }) => `0 ${theme.spacing['1']}`};
  text-transform: capitalize;
  border: 0.1rem solid
    ${({ theme, isOpen, hasError }) => {
      if (hasError) return theme.colors.error;
      return isOpen ? theme.colors.primary : theme.colors.background;
    }};

  &:focus {
    border-color: ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.primary)};
  }
`;

export const ItemContainer = styled.div`
  padding: ${({ theme }) => `${theme.spacing['1']} ${theme.spacing['0_5']}`};
`;

export const QuickSelectContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
