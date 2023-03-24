import { createGlobalStyle, keyframes } from 'styled-components';
import { ThemeType } from './theme';
import { SnackBarStyles } from './Snackbar';

const skeletonLoading = keyframes`
  0% { transform: translateX(-100%); }
  40%, 100% { transform: translateX(100%); }
`;

export const GlobalStyle = createGlobalStyle<{ theme: ThemeType }>`
  *::selection {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }
  :root {
    font-size: 62.5%; /* (62.5/100) * 16px = 10px */
    box-sizing: border-box;
  }

  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    scroll-behavior: smooth;
    font-family: 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme.colors.background};
  }

  body{
    padding: 0;
    margin: 0;
    transition: background-color 0.2s linear;
    overflow: hidden;
  }

  #root {
    margin: 0 auto;
    overflow-x: hidden;
  }

  a, p, div, ul, li, h1, h2, h3, h4, h5, h6, header, footer, fieldset, legend {
    font-weight: 400; /* Default size */
    font-family: 'Inter', sans-serif;
    font-feature-settings: "cv02","cv03","cv04","cv11";
    transition: background-color 0.2s linear;
    transition: box-shadow 0.125s linear;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    color: ${({ theme }) => theme.colors.text};
  }

  p, span, div, h4 {
    font-size: ${({ theme }) => theme.fontSize.small};
  }

  h1 {
    font-size: ${({ theme }) => theme.fontSize.large}
    font-weight: 800;
  }
  h2 {
    font-size: ${({ theme }) => theme.fontSize.mediumLarge}
    font-weight: 800;
  }
  h3 {
    font-size: ${({ theme }) => theme.fontSize.medium}
    font-weight: 600;
  }


  form {
    display: block;
    width: 100%;
  }

  input {
    margin: 0;
    outline: 0;
    padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing[1]}`};
    border-width: 2px;
    border-radius: 0.25rem;
    border-color: transparent;
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    color: ${({ theme }) => theme.colors.text};
    &[readOnly]{
      cursor: not-allowed;
      &:focus {
        border-color: none!important;
      }
    }
    &:focus {
      outline: 0;
    }
  }

  input[type='search']::-webkit-search-decoration,
  input[type='search']::-webkit-search-cancel-button,
  input[type='search']::-webkit-search-results-button,
  input[type='search']::-webkit-search-results-decoration {
    display: none;
  }

  li {
    list-style: none;
  }

  button {
    display: block;
    font-weight: 700;
    padding: ${({ theme }) =>
      `${theme.spacing['0_75']} ${theme.spacing['2_5']}`};
    border-radius: .8rem;
    border: none;

    &:disabled {
      cursor: default;
    }
  }

  a.underline {
    &:hover {
      text-decoration: underline;
      text-decoration-color: inherit;
      text-decoration-thickness: 1px;
    }
  }

  a, button {
    cursor: pointer;
    text-decoration: none;
    background-position: -100px;
    &:active, &:focus{
      outline: 0;
      outline-style: none;
      -moz-outline-style: none;
    }
  }

.placeholder {
    overflow: hidden;
    position: relative;
    border-radius: 10px;
    background-color: ${({ theme }): string => theme.colors.placeholder};
    &::before {
      content: '';
      width: 100%;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      transform: translateX(-100%);
      background-image: linear-gradient( 90deg, ${({ theme }): string =>
        theme.colors.placeholderHighlight}d3 0, ${({ theme }): string =>
  theme.colors.placeholderHighlight}4d 20%, ${({ theme }): string =>
  theme.colors.placeholderHighlight}66 60%, ${({ theme }): string =>
  theme.colors.placeholderHighlight}d3);
      animation: ${skeletonLoading} 2.5s infinite ease-in-out;
    }
  }

  /* notistack snackbar styling */
  ${SnackBarStyles}

  `;
