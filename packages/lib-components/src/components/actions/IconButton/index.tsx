import { cloneElement, forwardRef, ReactElement } from 'react';
import { Color, Size } from '../../../styled/types';
import { Default } from './style';

export interface IconButtonProps {
  size?: Size;
  color?: Color;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  icon: ReactElement;
  disabled?: boolean;
  /// Label for screen readers, must be descriptive of the action.
  ariaLabel: string;
  badge?: string;
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
  ({ icon, color = 'primary', size = 'medium', disabled, onClick = () => {}, ariaLabel, badge }, ref) => {
    return (
      <Default type="button" color={color} onClick={onClick} ref={ref} disabled={disabled} aria-label={ariaLabel}>
        {cloneElement(icon, { size: getSize(size) })}
        {badge && <div>{badge}</div>}
      </Default>
    );
  },
);
