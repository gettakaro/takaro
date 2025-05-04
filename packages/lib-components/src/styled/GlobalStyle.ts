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

  #takaro-root {
    margin: 0 auto;
    overflow-x: hidden;
    background-color: ${({ theme }) => theme.colors.background};
  }


  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    scroll-behavior: smooth;
    line-height: 1.5;
    font-family: 'Inter', sans-serif;
    font-weight: 400;
    font-size: ${({ theme }) => theme.fontSize.medium};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme.colors.background};

    @supports (scrollbar-gutter: stable) {
      scrollbar-gutter: stable;
    }
  }

  body{
    transition: background-color 0.2s linear;
    overflow: hidden;
  }

  a, p, div, ul, li, h1, h2, h3, h4, h5, h6, header, footer, fieldset, legend, dl, dt, dd{
    transition: background-color 0.2s linear;
    transition: box-shadow 0.125s linear;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    color: ${({ theme }) => theme.colors.text};
  }
  
  span {
    letter-spacing: normal;
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


  strong {
    padding: ${({ theme }) => `0 ${theme.spacing['0_25']}`};
    border-radius: ${({ theme }) => theme.borderRadius.small};
    border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    font-weight: 400;
    white-space: no-wrap;
  }

  form {
    display: block;
    width: 100%;
    fieldset {
      border: none;
    }
  }

  input, textarea {
    appearance: none;
    box-sizing: border-box;
    margin: 0;
    outline: 0;
    padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing[1]}`};
    border-width: 0.1rem;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    font-size: ${({ theme }) => theme.fontSize.small};
    border-color: transparent;
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    color: ${({ theme }) => theme.colors.text};
    font-family: inherit;
    &[readOnly]{
      cursor: default;
      &:focus {
        border-color: none!important;
      }
    }

    &:disabled {
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
    padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing['2_5']}`};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    border: none;

    &:disabled {
      cursor: default;
    }
  }

  a.underline {
    text-decoration: underline;
    text-decoration-color: inherit;
    text-decoration-thickness: 1px;
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
    border: 1px solid ${({ theme }): string => theme.colors.backgroundAccent};
    &::before {
      content: '';
      width: 100%;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      transform: translateX(-100%);
      background-image: linear-gradient(
        90deg, 
        ${({ theme }): string => theme.colors.placeholderHighlight}d3 0, 
        ${({ theme }): string => theme.colors.placeholderHighlight}4d 20%, 
        ${({ theme }): string => theme.colors.placeholderHighlight}66 60%, 
        ${({ theme }): string => theme.colors.placeholderHighlight}d3
      );
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
