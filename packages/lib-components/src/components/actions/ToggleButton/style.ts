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
    border: 0.1rem solid ${({ theme }): string => theme.colors.backgroundAccent};
    border-bottom: ${({ orientation, theme }) =>
      orientation === 'horizontal' ? `0.1rem solid ${theme.colors.backgroundAccent}` : 'none'};
    border-right: ${({ orientation, theme }) =>
      orientation === 'vertical' ? `0.1rem solid ${theme.colors.backgroundAccent}` : 'none'};

    &:first-child {
      ${({ orientation, theme }) => {
        if (orientation == 'horizontal') {
          return `
            border-top-left-radius: ${theme.borderRadius.small};
            border-bottom-left-radius: ${theme.borderRadius.small};
          `;
        } else {
          return `
        border-top-left-radius: ${theme.borderRadius.small};
        border-top-right-radius: ${theme.borderRadius.small};
          `;
        }
      }}
    }

    &:last-child {
      ${({ orientation, theme }) => {
        if (orientation == 'horizontal') {
          return `
            border-top-right-radius: ${theme.borderRadius.small};
            border-bottom-right-radius: ${theme.borderRadius.small};
            border-right: 0.1rem solid ${theme.colors.backgroundAccent};
          `;
        } else {
          return `
            border-bottom-right-radius: ${theme.borderRadius.small};
            border-bottom-left-radius: ${theme.borderRadius.small};
            border-bottom: 0.1rem solid ${theme.colors.backgroundAccent};
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
    isDisabled ? theme.colors.disabled : isSelected ? theme.colors.primary : theme.colors.background};
  cursor: ${({ isDisabled }) => (isDisabled ? 'default' : 'pointer')};

  svg {
    fill: ${({ theme, isSelected }) => (isSelected ? theme.colors.white : theme.colors.text)};
  }
`;
