import { shade } from 'polished';

export type Spacing =
  | '0'
  | '0_1'
  | '0_25'
  | '0_5'
  | '0_75'
  | '1'
  | '1_5'
  | '2'
  | '2_5'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10';

export const spacing: Record<Spacing, string> = {
  '0': '0px',
  '0_1': '1px',
  '0_25': '2px',
  '0_5': '4px',
  '0_75': '8px',
  '1': '12px',
  '1_5': '16px',
  '2': '20px',
  '2_5': '24px',
  '3': '28px',
  '4': '32px',
  '5': '40px',
  '6': '48px',
  '7': '56px',
  '8': '64px',
  '9': '72px',
  '10': '80px',
};

export const theme = {
  spacing,
  fontSize: {
    tiny: '10px',
    small: '12px',
    medium: '13.25px',
    mediumLarge: '14.5px',
    large: '24.25px',
    huge: '40px',
  },
  borderRadius: {
    small: '2.5px',
    medium: '5px',
    large: '8px',
  },
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
    backgroundAccent: '#353535',
    disabled: '#151515',
    info: '#664de5',
    success: '#3ccd6A',
    warning: '#f57c00',
    error: '#ff4252',
  },
};
