import { css } from 'styled-components';
import { ThemeType } from './theme';

export const OryStyles = css<{ theme: ThemeType }>`
  :root {
    --ui-50: ${({ theme }) => theme.colors.background};
    --ui-100: #00ff00;
    --ui-200: #ff0000;
    --ui-300: ${({ theme }) => theme.colors.backgroundAccent};
    --ui-400: ${({ theme }) => theme.colors.backgroundAlt};
    --ui-500: ${({ theme }) => theme.colors.background};
    --ui-600: ${({ theme }) => theme.colors.background};
    --ui-700: ${({ theme }) => theme.colors.text};
    --ui-800: ${({ theme }) => theme.colors.background};
    --ui-900: ${({ theme }) => theme.colors.primary};
    --ui-black: #000000;
    --ui-danger: ${({ theme }) => theme.colors.error};
    --ui-success: ${({ theme }) => theme.colors.success};
    --ui-warning: ${({ theme }) => theme.colors.warning};
    --ui-white: ${({ theme }) => theme.colors.white};

    --interface-background-default-primary: ${({ theme }) => theme.colors.background};
    --interface-foreground-default-primary: ${({ theme }) => theme.colors.text};

    --button-primary-background-default: ${({ theme }) => theme.colors.primary};
    --button-primary-foreground-default: ${({ theme }) => theme.colors.white};

    --border-radius-buttons: ${({ theme }) => theme.borderRadius.medium};
    --border-radius-forms: ${({ theme }) => theme.borderRadius.medium};
    --border-radius-general: ${({ theme }) => theme.borderRadius.medium};
    --border-radius-branding: ${({ theme }) => theme.borderRadius.medium};
    --border-radius-cards: ${({ theme }) => theme.borderRadius.medium};
  }
`;
