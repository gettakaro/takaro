import baseStyled, { ThemedStyledInterface } from 'styled-components';
import { breakpoint } from './breakpoint';
import { elevationLight, elevationDark } from './elevation';
import { spacing } from './spacing';
import { zIndex } from './zIndex';
import { shade } from 'polished';

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
  elevation: elevationLight,
  spacing,
  breakpoint,
  fontSize,
  borderRadius,
  zIndex,
  colors: {
    primary: '#664de5',
    primaryShade: shade(0.5, '#664de5'),
    secondary: '#030917',
    placeholder: '#f5f5f5',
    placeholderHighlight: '#ffffff',
    shade: '#eaf8f0',
    white: '#ffffff',
    background: '#f9f9f9',
    backgroundAlt: '#e9e9e9',
    // not set correctly yet.
    backgroundAccent: '#353535',
    disabled: '#151515',
    text: '#030303',
    textAlt: '#636363',
    info: '#664de5',
    success: '#3ccd6A',
    warning: '#f57c00',
    error: '#ff4252',
  },
};

// todo: this should be the color of modals:#343434
export const darkTheme: ThemeType = {
  elevation: elevationDark,
  spacing,
  breakpoint,
  fontSize,
  zIndex,
  borderRadius,
  colors: {
    primary: '#664DE5',
    primaryShade: shade(0.5, '#664de5'),
    secondary: '#353535',
    placeholder: '#202020',
    placeholderHighlight: '#303030',
    white: '#ffffff',
    shade: '#eaf8f0',
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
