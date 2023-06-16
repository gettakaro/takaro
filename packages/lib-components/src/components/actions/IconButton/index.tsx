import { cloneElement, FC, ReactElement } from 'react';
import { Color, Size, Variant } from '../../../styled/types';
import { Default, Outline } from './style';

export interface IconButtonProps {
  size?: Size;
  variant?: Variant;
  color: Color;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  icon: ReactElement;
}

const getSize = (size: Size) => {
  switch (size) {
    case 'tiny':
      return 15;
    case 'small':
      return 16;
    case 'medium':
      return 18;
    case 'large':
      return 20;
    case 'huge':
      return 24;
  }
};

export const IconButton: FC<IconButtonProps> = ({
  variant = 'default',
  icon,
  color,
  size = 'medium',
  onClick = () => {},
}) => {
  const getVariant = () => {
    const props = {
      color: color,
      onClick: onClick,
    };

    switch (variant) {
      case 'default':
        return (
          <Default {...props}>
            {cloneElement(icon, { size: getSize(size) })}
          </Default>
        );
      case 'outline':
        return (
          <Outline {...props}>
            {cloneElement(icon, { size: getSize(size) })}
          </Outline>
        );
    }
  };

  return getVariant();
};
