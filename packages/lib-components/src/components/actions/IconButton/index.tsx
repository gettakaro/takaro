import { cloneElement, FC, ReactElement } from 'react';
import { Color, Size, Variant } from '../../../styled/types';
import { Default, Outline, Clear } from './style';

export interface IconButtonProps {
  size?: Size;
  variant?: Variant;
  color?: Color;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => any;
  icon: ReactElement;
  isLoading?: boolean;
}

export const IconButton: FC<IconButtonProps> = ({
  variant = 'default',
  icon,
  color = 'primary',
  size = 'medium',
  onClick = () => {},
}) => {
  // TODO: define size in switch

  const getVariant = () => {
    const props = {
      color: color,
      onClick: onClick,
      size: size,
    };

    switch (variant) {
      case 'default':
        return <Default {...props}>{cloneElement(icon, { size: 24 })}</Default>;
      case 'clear':
        return <Clear {...props}>{cloneElement(icon, { size: 24 })}</Clear>;
      case 'outline':
        return <Outline {...props}>{cloneElement(icon, { size: 24 })}</Outline>;
    }
  };

  return getVariant();
};
