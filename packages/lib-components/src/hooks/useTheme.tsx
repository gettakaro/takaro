import { useContext } from 'react';
import type { ThemeType } from '../styled/theme';
import { ThemeContext } from 'styled-components';

export const useTheme = (): ThemeType => {
  return useContext<ThemeType>(ThemeContext);
};
