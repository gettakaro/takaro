import { FloatingOverlay } from '@floating-ui/react';
import { styled } from '../../../styled';
import { AiOutlineDown as ArrowIcon } from 'react-icons/ai';

export const Container = styled.div`
  position: relative;
`;

export const SelectButton = styled.div<{
  readOnly: boolean;
  isOpen: boolean;
  hasError: boolean;
}>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  width: 100%;
  cursor: ${({ readOnly }) => (readOnly ? 'not-allowed' : 'pointer')};
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
    border-color: ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.primary)};
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

export const StyledArrowIcon = styled(ArrowIcon)`
  margin-left: ${({ theme }) => theme.spacing['0_75']};
`;

export const StyledFloatingOverlay = styled(FloatingOverlay)`
  width: 100%;
  height: 100%;
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

export const OptionContainer = styled.li<{ isActive: boolean; isMultiSelect: boolean; isGrouped: boolean }>`
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing['1']}`};
  min-height: ${({ theme }) => theme.spacing[4]};
  cursor: default;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: ${({ isMultiSelect }) => (isMultiSelect ? 'flex-start' : 'space-between')};
  transition: transform 0.15s ease-out;
  outline: 0;
  scroll-margin: ${({ theme }) => theme.spacing['0_75']};
  padding-left: ${({ isGrouped, theme }) => (isGrouped ? `calc(1.7 * ${theme.spacing['2']})` : theme.spacing['1'])}};

  &:focus {
    background-color: ${({ theme }) => theme.colors.background};
    color: rgba(255, 255, 255, 0.9);
    position: relative;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
    span {
      color: white;
    }
  }

  & > div {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[1]};

    span {
      cursor: pointer;
      color: ${({ theme, isActive }) => (isActive ? theme.colors.white : theme.colors.text)};
    }
  }
`;

export const GroupContainer = styled.ul`
  padding-bottom: ${({ theme }) => theme.spacing['0_75']};
  &:last-child {
    padding-bottom: 0;
  }
`;

export const GroupLabel = styled.li`
  opacity: 0.5;
  padding: ${({ theme }) => `${theme.spacing['0_5']} ${theme.spacing['1_5']}`};
  align-items: center;
  justify-content: flex-start;
  display: flex;
  padding-left: ${({ theme }) => theme.spacing['0_25']};

  img,
  svg {
    width: ${({ theme }) => theme.spacing[2]}!important;
    height: ${({ theme }) => theme.spacing[2]}!important;
    margin: 0 !important;
    margin-bottom: 0 !important;
    margin-right: ${({ theme }) => theme.spacing['1']}!important;
    fill: ${({ theme }) => theme.colors.primary};
  }
`;

export const LoadingContainer = styled.div``;
