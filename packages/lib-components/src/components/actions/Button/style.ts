import { styled, Color, Size, AlertVariants } from '../../../styled';
import { shade } from 'polished';

export type ButtonColor = Color | AlertVariants | 'background' | 'white';

export const Default = styled.button<{
  size: Size;
  color: ButtonColor;
  icon: boolean;
  iconPosition: 'left' | 'right';
  fullWidth: boolean;
  isLoading: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'fit-content')};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-size: 200% auto;
  cursor: ${({ isLoading }) => (isLoading ? 'default' : 'pointer')};
  line-height: 1.9rem;
  letter-spacing: 0;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid ${({ theme, color }) => theme.colors[color]};
  background: ${({ theme, color }) => shade(0.5, theme.colors[color])};

  &:focus {
    outline: 0;
  }
  &:hover {
    background-position: right center;
  }

  span {
    font-size: 1.25rem;
    font-weight: 600;
    white-space: nowrap;
    color: ${({ theme, color }) => {
      switch (color) {
        case 'white':
          return theme.colors.primary;
        case 'background':
          return theme.colors.text;
        default:
          return 'white';
      }
    }};

    margin-left: ${({ icon, isLoading, iconPosition }): string =>
      iconPosition === 'left' && (icon || isLoading) ? '10px' : '0px'};
    margin-right: ${({ icon, isLoading, iconPosition }): string =>
      iconPosition === 'right' && (icon || isLoading) ? '10px' : '0px'};
  }

  &:disabled {
    cursor: default;
    background: ${({ theme }) => theme.colors.disabled};
    border-color: ${({ theme }) => theme.colors.disabled};
  }

  svg {
    display: ${({ icon, isLoading }): string => (icon || isLoading ? 'block' : 'none')};
    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
    fill: ${({ theme, color }) => {
      switch (color) {
        case 'white':
          return theme.colors.primary;
        case 'background':
          return theme.colors.text;
        default:
          return 'white';
      }
    }};
    stroke: white;
  }

  ${({ size, theme }) => {
    switch (size) {
      case 'tiny':
        return `
          padding: ${theme.spacing['0_25']} ${theme.spacing['0_75']};
        `;
      case 'small':
        return `
          padding: ${theme.spacing['0_5']} ${theme.spacing['1']}
        `;
      case 'medium':
        return `
          padding: ${theme.spacing['0_75']} ${theme.spacing['1_5']}
        `;
      case 'large':
        return `
          padding: ${theme.spacing['1']} ${theme.spacing['2']}
        `;
      case 'huge':
        return `
          span {
            font-size: 125%;
          }
          padding: ${theme.spacing[1]} ${theme.spacing[2]}
        `;
    }
  }}
`;

export const Outline = styled(Default)<{ color: ButtonColor }>`
  background: transparent;
  border: 0.1rem solid ${({ theme, color }): string => theme.colors[color]};
  span {
    color: ${({ theme, color }): string => theme.colors[color]};
  }

  &:hover {
    background-position: right center;
  }

  &:disabled {
    background: none;
    border-color: ${({ theme }): string => theme.colors.text};
    span {
      color: ${({ theme }): string => theme.colors.text};
    }
    svg {
      fill: ${({ theme }): string => theme.colors.backgroundAlt};
      stroke: ${({ theme }): string => theme.colors.backgroundAlt};
    }
  }

  svg {
    fill: ${({ theme, color }): string => theme.colors[color]};
    stroke: ${({ theme, color }): string => theme.colors[color]};
  }
`;

export const Clear = styled(Outline)`
  background: transparent;
  box-shadow: none;
  border: none;
  span {
    color: ${({ theme, color }): string => theme.colors[color]};
  }
`;
