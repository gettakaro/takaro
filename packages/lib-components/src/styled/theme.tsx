import baseStyled, { ThemedStyledInterface, ThemeProvider as StyledComponentsThemeProvider } from 'styled-components';
import { breakpoint } from './breakpoint';
import { spacing } from './spacing';
import { zIndex } from './zIndex';
import { FC, PropsWithChildren, createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks';

const fontSize = {
  tiny: '1rem',
  small: '1.2rem',
  medium: '1.325rem',
  mediumLarge: '1.45rem',
  large: '2.425rem',
  huge: '4rem',
};

const borderRadius = {
  // For tiny components like checkboxes, tags and labels
  small: '0.25rem',
  // For medium components like buttons, inputs and similar components
  medium: '0.5rem',
  // For large components like modals and similar components
  large: '0.8rem',
};

export const lightTheme = {
  spacing,
  breakpoint,
  fontSize,
  borderRadius,
  zIndex,
  colors: {
    primary: '#664de5',
    secondary: '#f0f0f0',
    placeholder: '#f0f0f0',
    placeholderHighlight: '#ffffff',
    white: '#ffffff',
    background: '#f5f5f5',
    backgroundAlt: '#e0e0e0',
    backgroundAccent: '#909090',
    disabled: '#d0d0d0',
    text: '#202020',
    textAlt: '#666666',
    info: '#664de5',
    success: '#3ccd6A',
    warning: '#f57c00',
    error: '#ff4252',
  },
};

export const darkTheme: ThemeType = {
  spacing,
  breakpoint,
  fontSize,
  zIndex,
  borderRadius,
  colors: {
    primary: '#664DE5',
    secondary: '#353535',
    placeholder: '#202020',
    placeholderHighlight: '#303030',
    white: '#ffffff',
    text: '#c2c2c2',
    textAlt: '#818181',
    background: '#080808',
    backgroundAlt: '#121212',
    // this is basically for when it is unsure if the background is background or backgroundAlt
    // Often used for borders and such.
    backgroundAccent: '#353535',
    disabled: '#151515',
    info: '#664de5',
    success: '#3ccd6A',
    warning: '#f57c00',
    error: '#ff4252',
  },
};

export type ThemeType = typeof lightTheme;
export const styled = baseStyled as ThemedStyledInterface<ThemeType>;

export type ThemeName = 'light' | 'dark';
const themes: Record<ThemeName, ThemeType> = {
  light: lightTheme,
  dark: darkTheme,
};

/// Multiple themes:
interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeSwitcher = () => {
  const context = useContext(ThemeContext);
  if (context == undefined) {
    throw new Error('useThemeSwitcher must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const { storedValue, setValue } = useLocalStorage<ThemeName>('theme', 'dark');

  return (
    <ThemeContext.Provider value={{ theme: storedValue, setTheme: setValue }}>
      <StyledComponentsThemeProvider theme={themes[storedValue]}>{children} </StyledComponentsThemeProvider>
    </ThemeContext.Provider>
  );
};
