import baseStyled, { ThemedStyledInterface } from 'styled-components';

export const theme = {
  colors: {
    primary: '#664DE5',
    secondary: '#030917',
    tertiary: '#be81f6',
    quaternary: '#e5cc4d',

    placeholder: '#f5f5f5',
    placeholderHighlight: '#ffffff',
    shade: '#EAF8F0',
    white: '#ffffff',
    gray: '#d3d3d3',
    background: '#e8edf5',
    text: '#336',
    info: '#664DE5',
    success: '#3CCD6A',
    warning: '#f57c00',
    error: '#FF4252'
  },
  shadows: {
    default: 'rgb(0 0 0 / 5%) 0px 15px 30px 0px'
  },

  spacing: {
    small: '1rem',
    medium: '1.5rem',
    large: '2rem'
  },
  fontSize: {
    tiny: '1rem',
    small: '1.3rem',
    medium: '1.825rem',
    mediumLarge: '2.825rem',
    large: '4.25rem',
    huge: '6rem'
  }
};

export type ThemeType = typeof theme;
export const styled = baseStyled as ThemedStyledInterface<ThemeType>;
