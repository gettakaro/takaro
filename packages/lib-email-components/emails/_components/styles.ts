import { CSSProperties } from 'react';
import { theme } from './theme';

export const containerStyle: CSSProperties = {
  backgroundColor: theme.colors.background,
  margin: '0 auto',
  padding: `${theme.spacing['2']} 0 ${theme.spacing['4']}`,
  marginBottom: theme.spacing[4],
  border: `1px solid ${theme.colors.backgroundAccent}`,
  borderRadius: theme.borderRadius.medium,
};

export const boxStyle: CSSProperties = {
  padding: `0 ${theme.spacing['4']}`,
};

export const headingStyle: CSSProperties = {
  color: theme.colors.text,
};

export const hrStyle = {
  borderColor: theme.colors.backgroundAccent,
  margin: '20px 0',
};

export const buttonStyle: CSSProperties = {
  backgroundColor: theme.colors.primaryShade,
  border: `1px solid ${theme.colors.primary}`,
  padding: `${theme.spacing['0_75']} ${theme.spacing['2']}`,
  color: theme.colors.white,
  borderRadius: theme.borderRadius.medium,
  fontWeight: 500,
  // TODO: should be inter font
  textDecoration: 'none',
  display: 'block',
};

export const paragraphStyle: CSSProperties = {
  color: theme.colors.text,
};
