import { styled } from '../../../styled';
import { Color, AlertVariants, Size } from '../../../styled/types';

export const Container = styled.button<{
  size: Size;
  white: boolean;
  icon: boolean;
  isLoading: boolean;
  color: Color | AlertVariants | 'background';
  outline: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  border-radius: 0.5rem;

  background: ${({ theme, outline, white, color }): string => {
    if (outline) return 'transparent;';
    else if (white) return 'white;';
    else return `${theme.colors[color]};`;
  }};
  background-size: 200% auto;
  border: 2px solid
    ${({ theme, outline, white, color }) => {
      if (white) return 'white;';
      else if (outline) return `${theme.colors[color]};`;
      else return 'none;';
    }};
  cursor: pointer;
  line-height: 19px;
  letter-spacing: 0;
  box-shadow: ${({ white, theme }): string =>
    white ? 'none' : theme.shadows.default};
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  span {
    margin-left: ${({ icon, isLoading }): string =>
      icon || isLoading ? '10px' : '0px'};
    color: ${({ color, theme, outline, white }) =>
      outline
        ? white
          ? 'white'
          : theme.colors[color]
        : white
        ? 'black'
        : 'white'};
    font-size: 1.25rem;
    font-weight: 600;
    &:hover {
      color: ${({ color, outline, theme, white }): string =>
        white
          ? outline
            ? 'white'
            : theme.colors[color]
          : outline
          ? theme.colors[color]
          : 'white'};
    }
  }

  &:focus {
    outline: 0;
  }
  &:hover {
    background-position: right center;
  }
  &:disabled {
    cursor: default;
    background: ${({ theme, outline }) =>
      outline ? 'transparent' : theme.colors.gray};
    border-color: ${({ theme, outline }) =>
      outline ? theme.colors.gray : 'transparent'};
    color: ${({ theme, outline }) => (outline ? theme.colors.gray : 'white')};

    span {
      color: ${({ theme, outline }) => (outline ? theme.colors.gray : 'white')};
    }
    &:hover {
      span {
        color: ${({ theme, outline }): string =>
          outline ? theme.colors.gray : 'white'};
      }
    }
  }

  svg {
    display: ${({ icon, isLoading }): string =>
      icon || isLoading ? 'block' : 'none'};
    cursor: pointer;
    fill: ${({ color, theme, outline, white }): string =>
      outline ? theme.colors[color] : white ? theme.colors[color] : 'white'};
    stroke: ${({ color, theme, outline, white }): string =>
      outline
        ? white
          ? 'white'
          : theme.colors[color]
        : white
        ? theme.colors[color]
        : 'white'};
  }

  ${({ size }) => {
    switch (size) {
      case 'tiny':
        return `
          padding: 4px 8px;
        `;
      case 'small':
        return `
          padding: 6px 15px;
        `;
      case 'medium':
        return `
          padding: 11px 18px;
        `;
      case 'large':
        return `
          padding: 14px 22px;
        `;
      case 'huge':
        return `
          span {
            font-size: 105%;
          }
          padding: 16px 24px;
        `;
    }
  }}
`;
