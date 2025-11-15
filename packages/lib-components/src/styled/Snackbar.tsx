import { css } from 'styled-components';
import { ThemeType } from './theme';

export const SnackBarStyles = css<{ theme: ThemeType }>`
  /* Snackbar snack colors for every type */
  .mui-snackbar {
    color: white;
  }
  .MuiSnackbarContent-root {
    background-color: ${({ theme }): string => theme.colors.primary};
    color: white;
  }
  #notistack-snackbar {
    font-weight: 600;
    font-family: 'Lato', sans-serif;
    color: ${({ theme }) => theme.colors.text};
    font-size: 1.5rem;
    padding: 2rem;
  }

  div.SnackbarContent-root {
    border: 1px solid ${({ theme }) => theme.colors.background};
  }

  /* info */
  div.SnackbarItem-variantInfo {
    background-color: ${({ theme }): string => theme.colors.white}!important;
  }
  /* success */
  div.SnackbarItem-variantSuccess {
    background-color: ${({ theme }): string => theme.colors.white}!important;
  }
  /* warning */
  div.SnackbarItem-variantWarning {
    background-color: ${({ theme }): string => theme.colors.white}!important;
  }
  /* error */
  div.SnackbarItem-variantError {
    background-color: ${({ theme }): string => theme.colors.background}!important;
  }
`;
