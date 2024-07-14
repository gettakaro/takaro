import { styled } from '../../../styled';
import { FloatingOverlay } from '@floating-ui/react';
import { AiOutlineDown as ArrowIcon } from 'react-icons/ai';

export const Container = styled.div`
  position: relative;
  width: 100%;
`;

export const SelectContainer = styled.div`
  list-style-type: none;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing['0_75']};
  outline: 0;
  border: 0.1rem solid ${({ theme }) => theme.colors.backgroundAccent};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  box-shadow: ${({ theme }) => theme.elevation[4]};
  text-transform: capitalize;
  z-index: ${({ theme }) => theme.zIndex.dropdown};
`;

export const SelectButton = styled.div<{
  readOnly: boolean;
  disabled: boolean;
  isOpen: boolean;
  hasError: boolean;
}>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  width: 100%;
  cursor: ${({ readOnly, disabled }) => {
    if (disabled) {
      return 'not-allowed';
    }
    if (readOnly) {
      return 'default';
    }
    return 'pointer';
  }};

  font-family: inherit;
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing['1']}`};
  outline: 0;
  position: relative;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border: 0.1rem solid
    ${({ theme, isOpen, hasError }) => {
      if (hasError) return theme.colors.error;
      return isOpen ? theme.colors.primary : theme.colors.backgroundAccent;
    }};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-weight: 500;
  text-transform: capitalize;

  &:focus {
    border-color: ${({ theme, hasError, disabled }) =>
      hasError ? theme.colors.error : disabled ? theme.colors.backgroundAccent : theme.colors.primary};
  }

  & > div {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[1]};
  }

  span {
    display: flex;
  }
`;

export const StyledArrowIcon = styled(ArrowIcon)``;

export const StyledFloatingOverlay = styled(FloatingOverlay)`
  width: 100%;
  height: 100%;
`;
