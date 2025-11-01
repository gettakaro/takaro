import { createContext } from 'react';

export type Direction = 'horizontal' | 'vertical';
export type Size = 'small' | 'medium' | 'large';

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
