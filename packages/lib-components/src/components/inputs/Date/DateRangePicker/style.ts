import { styled } from '../../../../styled';

export const Container = styled.div`
  width: 100%;
  position: relative;
`;

export const DateRangePickerContainer = styled.div<{
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
      return isOpen ? theme.colors.primary : theme.colors.backgroundAccent;
    }};

  &:focus {
    border-color: ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.primary)};
  }

  flex-shrink: 0;
`;

export const ItemContainer = styled.div<{ readOnly: boolean; disabled: boolean }>`
  cursor: ${({ readOnly, disabled }) => {
    if (disabled) return 'not-allowed';
    if (readOnly) return 'default';
    return 'pointer';
  }};
  padding: ${({ theme }) => `${theme.spacing['0_75']}`};
  color: ${({ theme, disabled }) => (disabled ? theme.colors.backgroundAccent : theme.colors.text)};
`;

export const QuickSelectContainer = styled.div<{ readOnly: boolean; disabled: boolean }>`
  border-radius: ${({ theme }) => `${theme.borderRadius.medium} 0 0 ${theme.borderRadius.medium};`};
  height: 100%;
  cursor: ${({ readOnly, disabled }) => {
    if (disabled) return 'not-allowed';
    if (readOnly) return 'default';
    return 'pointer';
  }};
  gap: ${({ theme }) => theme.spacing['0_25']};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => `0 ${theme.spacing['0_75']}`};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-right: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  flex-shrink: 0;
`;
