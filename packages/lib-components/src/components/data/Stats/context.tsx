import { createContext } from 'react';
import { Size } from '../../../styled/types';

export type Direction = 'horizontal' | 'vertical';

interface StatsContextValue {
  grouped: boolean;
  direction: Direction;
  size: Size;
}

const defaultValue: StatsContextValue = {
  grouped: false,
  direction: 'vertical',
  size: 'medium',
};

export const StatContext = createContext<StatsContextValue>(defaultValue);
