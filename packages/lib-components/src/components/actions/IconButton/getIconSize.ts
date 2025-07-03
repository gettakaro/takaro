import { Size } from '../../../styled/types';

export const getIconSize = (size: Size) => {
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
