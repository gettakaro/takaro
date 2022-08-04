import { FC, ReactNode } from 'react';
import { styled } from '../../../styled';
import { Color, Size, Variant } from '../../../styled/types';

const Container = styled.button<{ size: Size; variant: Variant; color: Color }>`
  svg {
    cursor: pointer;
    path {
      fill: ${({ theme, variant, color }) =>
        variant !== 'default' ? theme.colors[color] : theme.colors.white}!important;
      stroke: ${({ theme, variant, color }) =>
        variant !== 'default' ? theme.colors[color] : theme.colors.white}!important;
    }
  }

  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.645, 0.045, 0.355, 1) 0s;
  background-color: ${({ theme, variant }) => {
    switch (variant) {
      case 'default':
        return theme.colors.primary;
      case 'clear' || 'outline':
        return 'transparent';
    }
  }};

  &:hover {
    background: ${({ theme, variant, color }) => {
      if (variant === 'clear') {
        return 'rgb(243, 245, 249) none repeat scroll 0% 0%';
      }
      if (variant === 'outline') {
        return 'transparent';
      }
    }};
  }

  border-radius: 1rem;
  border: 3px solid
    ${({ theme, variant }) => (variant === 'outline' ? theme.colors.primary : 'transparent')};
  background-clip: padding-box;
  cursor: pointer;

  ${({ size }) => {
    switch (size) {
      case 'tiny':
        return `
          padding: 2px;
        `;
      case 'small':
        return `
          padding: 4px;
        `;
      case 'medium':
        return `
          padding: 8px;
        `;
      case 'large':
        return `
          padding: 16px;
        `;
      case 'huge':
        return `
          padding: 30px;
        `;
    }
  }};
`;

export interface IconButtonProps {
  size?: Size;
  variant?: Variant;
  color?: Color;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => any;
  icon: ReactNode;
}

export const IconButton: FC<IconButtonProps> = ({
  variant = 'default',
  icon,
  color = 'primary',
  size = 'medium',
  onClick
}) => {
  return (
    <Container color={color} onClick={onClick} size={size} variant={variant}>
      {icon}
    </Container>
  );
};
