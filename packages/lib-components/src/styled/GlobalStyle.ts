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

  #root {
    margin: 0 auto;
    overflow-x: hidden;
  }


  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    scroll-behavior: smooth;
    line-height: 1.5;
    font-family: 'Inter', sans-serif;
    font-weight: 400; /* Default size */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme.colors.background};
  }

  body{
    transition: background-color 0.2s linear;
    overflow: hidden;
  }

  a, p, div, ul, li, h1, h2, h3, h4, h5, h6, header, footer, fieldset, legend {
    transition: background-color 0.2s linear;
    transition: box-shadow 0.125s linear;
    font-size: ${({ theme }) => theme.fontSize.medium};
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    color: ${({ theme }) => theme.colors.text};
  }

  h1 {
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: 600;
  }
  h2 {
    font-size: ${({ theme }) => theme.fontSize.mediumLarge};
    font-weight: 600;
  }
  h3 {
    font-size: ${({ theme }) => theme.fontSize.medium};
    font-weight: 500;
  }


  form {
    display: block;
    width: 100%;
  }

  input, textarea {
    margin: 0;
    outline: 0;
    padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing[1]}`};
    border-width: 0.1rem;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
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

  textarea {
    resize: vertical;
    width: calc(100% - ${({ theme }) => theme.spacing[1]} * 2);
    min-height: 200px;
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
    padding: ${({ theme }) =>
      `${theme.spacing['0_75']} ${theme.spacing['2_5']}`};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
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
    border-radius: ${({ theme }): string => theme.borderRadius.large};
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

  .simplebar-mask {
    &:focus-visible {
      border: none;
    }
  }

  

  /* notistack snackbar styling */
  ${SnackBarStyles}

  `;
