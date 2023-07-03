import { styled } from '../../../styled';
import { ChipColor } from '.';

export const Container = styled.div<{
  disabled: boolean;
  color: ChipColor;
  outline: boolean;
  hasAvatar: boolean;
  clickable: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing['0_1']} ${theme.spacing['0_5']}`};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: ${({ clickable }): string => (clickable ? 'pointer' : 'auto')};

  svg {
    margin-left: ${({ theme }) => theme.spacing['0_5']};
    cursor: pointer;
    ${({ theme, color, outline }) => {
      if (!outline) {
        return 'fill: white; stroke: white;';
      }
      return `fill: ${theme.colors[color]};`;
    }}
  }

  ${({ theme, color, outline }): string => {
    if (!outline) {
      return 'border: 0.1rem solid transparent;';
    }
    return `border: 0.1rem solid ${theme.colors[color]};`;
  }}

  span {
    display: block;
    white-space: normal;
    overflow-wrap: anywhere;
    margin-left: ${({ hasAvatar, theme }) => (hasAvatar ? theme.spacing['0_5'] : 0)};
    font-size: ${({ theme }) => theme.fontSize.tiny};

    ${({ theme, color, outline }) => {
      if (!outline) {
        return 'color: white;';
      }
      return `color: ${theme.colors[color]};`;
    }}
  }

  ${({ theme, color, outline }): string => {
    if (outline) {
      return 'background-color: transparent;';
    }
    return `background-color: ${theme.colors[color]};`;
  }}
`;

export const Dot = styled.div<{ color: ChipColor; outline: boolean }>`
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  margin-right: ${({ theme }) => theme.spacing['0_5']};
  background-color: ${({ outline, theme, color }) => (outline ? theme.colors[color] : 'white')};
`;
