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
  padding: 3px 12px;
  border-radius: 1.5rem;
  cursor: ${({ clickable }): string => (clickable ? 'pointer' : 'auto')};

  svg {
    margin-left: 0.5rem;
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
      return 'border: 2px solid transparent;';
    }
    return `border: 2px solid ${theme.colors[color]};`;
  }}

  span {
    display: block;
    white-space: nowrap;
    margin-left: ${({ hasAvatar }) => (hasAvatar ? '5px' : 0)};
    font-weight: 600;
    font-size: 1.225rem;

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
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: ${({ outline, theme, color }) => (outline ? theme.colors[color] : 'white')};
`;
