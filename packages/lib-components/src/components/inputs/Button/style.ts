import { styled } from '../../../styled';
import { Color, Size, AlertVariants } from '../../../styled/types';

export type ButtonColor = Color | AlertVariants | 'background';

export const Default = styled.button<{
  size: Size;
  color: ButtonColor;
  icon: boolean;
  isLoading: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  border-radius: 0.5rem;
  background-size: 200% auto;
  cursor: ${({ isLoading }) => (isLoading ? 'default' : 'pointer')};
  line-height: 1.9rem;
  letter-spacing: 0;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background: ${({ theme, color }) => theme.colors[color]};

  &:focus {
    outline: 0;
  }
  &:hover {
    background-position: right center;
  }

  span {
    font-size: 1.25rem;
    font-weight: 600;
    color: white;
    margin-left: ${({ icon, isLoading }): string =>
      icon || isLoading ? '10px' : '0px'};
  }

  &:disabled {
    cursor: default;
    background: ${({ theme }) => theme.colors.gray};
    border-color: white;
  }

  svg {
    display: ${({ icon, isLoading }): string =>
      icon || isLoading ? 'block' : 'none'};
    cursor: pointer;
    fill: white;
    stroke: white;
  }

  ${({ size }) => {
    switch (size) {
      case 'tiny':
        return `
          padding: 0.4rem 0.8rem;
        `;
      case 'small':
        return `
          padding: .6rem 1.5rem;
        `;
      case 'medium':
        return `
          padding: 1.1rem 1.8rem;
        `;
      case 'large':
        return `
          padding: 1.4rem 2.2rem;
        `;
      case 'huge':
        return `
          span {
            font-size: 105%;
          }
          padding: 1.6rem 2.4rem;
        `;
    }
  }}
`;

export const Outline = styled(Default)<{ color: ButtonColor }>`
  background: transparent;
  border: 0.2rem solid ${({ theme, color }): string => theme.colors[color]};
  span {
    color: ${({ theme, color }): string => theme.colors[color]};
  }
  &:disabled {
    background: none;
    border-color: ${({ theme }): string => theme.colors.gray};
    span {
      color: ${({ theme }): string => theme.colors.gray};
    }
    svg {
      fill: ${({ theme }): string => theme.colors.gray};
      stroke: ${({ theme }): string => theme.colors.gray};
    }
  }

  svg {
    fill: ${({ theme, color }): string => theme.colors[color]};
    stroke: ${({ theme, color }): string => theme.colors[color]};
  }

  ${({ size }) => {
    switch (size) {
      case 'tiny':
        return `
          padding: 0.2rem 0.6rem;
        `;
      case 'small':
        return `
          padding: .4rem 1.3rem;
        `;
      case 'medium':
        return `
          padding: 0.9rem 1.6rem;
        `;
      case 'large':
        return `
          padding: 1.2rem 2rem;
        `;
      case 'huge':
        return `
          span {
            font-size: 105%;
          }
          padding: 1.4rem 2.2rem;
        `;
    }
  }}
`;

export const Clear = styled(Outline)`
  background: transparent;
  box-shadow: none;
  border: none;
  span {
    color: ${({ theme, color }): string => theme.colors[color]};
  }

  ${({ size }) => {
    switch (size) {
      case 'tiny':
        return `
          padding: 0.4rem 0.8rem;
        `;
      case 'small':
        return `
          padding: .6rem 1.5rem;
        `;
      case 'medium':
        return `
          padding: 1.1rem 1.8rem;
        `;
      case 'large':
        return `
          padding: 1.4rem 2.2rem;
        `;
      case 'huge':
        return `
          span {
            font-size: 105%;
          }
          padding: 1.6rem 2.4rem;
        `;
    }
  }}
`;

export const White = styled(Clear)`
  background: ${({ theme }): string => theme.colors.white};
  &:disabled {
    background-color: white;
  }

  ${({ size }) => {
    switch (size) {
      case 'tiny':
        return `
          padding: 0.4rem 0.8rem;
        `;
      case 'small':
        return `
          padding: .6rem 1.5rem;
        `;
      case 'medium':
        return `
          padding: 1.1rem 1.8rem;
        `;
      case 'large':
        return `
          padding: 1.4rem 2.2rem;
        `;
      case 'huge':
        return `
          span {
            font-size: 105%;
          }
          padding: 1.6rem 2.4rem;
        `;
    }
  }}
`;
