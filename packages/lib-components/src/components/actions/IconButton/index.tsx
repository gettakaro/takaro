import { cloneElement, forwardRef, ReactElement } from 'react';
import { Color, Size } from '../../../styled/types';
import { Default } from './style';

export interface IconButtonProps {
  size?: Size;
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

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, color, size = 'medium', onClick = () => {} }, ref) => {
    return (
      <Default color={color} onClick={onClick} ref={ref}>
        {cloneElement(icon, { size: getSize(size) })}
      </Default>
    );
  }
);
