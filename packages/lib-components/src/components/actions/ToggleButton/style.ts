import { styled } from '../../../styled';
import { orientation } from './ToggleButtonGroup';

export const Container = styled.div<{
  orientation: orientation;
  fullWidth: boolean;
}>`
  display: flex;
  flex-direction: ${({ orientation }) => (orientation === 'horizontal' ? 'row' : 'column')};
  align-items: center;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'max-content')};
  height: 100%;

  button {
    padding: ${({ theme }) => `${theme.spacing['0_5']} ${theme.spacing[1]}`};
    flex-basis: ${({ fullWidth }) => (fullWidth ? '100%' : '')};
    border: 0.1rem solid ${({ theme }): string => theme.colors.backgroundAlt};
    border-bottom: ${({ orientation, theme }) =>
      orientation === 'horizontal' ? `0.1rem solid ${theme.colors.backgroundAlt}` : 'none'};
    border-right: ${({ orientation, theme }) =>
      orientation === 'vertical' ? `0.1rem solid ${theme.colors.backgroundAlt}` : 'none'};

    &:first-child {
      ${({ orientation, theme }) => {
        if (orientation == 'horizontal') {
          return `
            border-top-left-radius: ${theme.borderRadius.medium};
            border-bottom-left-radius: ${theme.borderRadius.medium};
          `;
        } else {
          return `
        border-top-left-radius: ${theme.borderRadius.medium};
        border-top-right-radius: ${theme.borderRadius.medium};
          `;
        }
      }}
    }

    &:last-child {
      ${({ orientation, theme }) => {
        if (orientation == 'horizontal') {
          return `
            border-top-right-radius: ${theme.borderRadius.medium};
            border-bottom-right-radius: ${theme.borderRadius.medium};
            border-right: 0.1rem solid ${theme.colors.backgroundAlt};
          `;
        } else {
          return `
            border-bottom-right-radius: ${theme.borderRadius.medium};
            border-bottom-left-radius: ${theme.borderRadius.medium};
            border-bottom: 0.1rem solid ${theme.colors.backgroundAlt};
      `;
        }
      }}
    }
  }
`;

export const Item = styled.button<{ isSelected: boolean; isDisabled: boolean }>`
  color: none;
  display: block;
  border-radius: 0;
  width: 100%;
  position: relative;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 400;
  border-left: none;
  background-color: ${({ theme, isSelected, isDisabled }) =>
    isSelected ? theme.colors.primary : isDisabled ? theme.colors.disabled : theme.colors.background};
  cursor: ${({ isDisabled }) => (isDisabled ? 'default' : 'pointer')};

  svg {
    fill: ${({ theme, isSelected }) => (isSelected ? theme.colors.white : theme.colors.text)};
  }
`;
