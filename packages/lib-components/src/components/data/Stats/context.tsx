import { createContext } from 'react';

export type Direction = 'horizontal' | 'vertical';

interface StatsContextValue {
  border: boolean;
  direction: Direction;
  // TODO: size?: Size;
}

export const StatContext = createContext<StatsContextValue>(null as any);
