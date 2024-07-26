import { FC, PropsWithChildren, ReactElement, ReactNode } from 'react';
import { SnackbarProvider as Provider, SnackbarProviderProps } from 'notistack';
import {
  DefaultSnack,
  DrawerSnack,
  NetworkDetectorOnlineSnack,
  NetworkDetectorOfflineSnack,
  CookieConsentSnack,
} from '../components/feedback/snacks';

import { ButtonProps } from '../components';
import { AlertVariants } from '../styled';

const snackbarOptions: Partial<SnackbarProviderProps> = {
  anchorOrigin: {
    horizontal: 'right',
    vertical: 'bottom',
  },
  autoHideDuration: 4000,
  hideIconVariant: true,
  maxSnack: 3,
  preventDuplicate: true,
  Components: {
    default: DefaultSnack,
    drawer: DrawerSnack,
    cookieConsent: CookieConsentSnack,
    networkDetectorOffline: NetworkDetectorOfflineSnack,
    networkDetectorOnline: NetworkDetectorOnlineSnack,
  },
};

export const SnackbarProvider: FC<PropsWithChildren<unknown>> = ({ children }) => (
  <Provider {...snackbarOptions}>{children}</Provider>
);

declare module 'notistack' {
  interface VariantOverrides {
    /* IMPORTANT: These props need to be kept in sync with the props defined in helpers/getSnackbarProvider */
    default: {
      title?: string;
      button1?: ReactElement<ButtonProps>;
      button2?: ReactElement<ButtonProps>;
      type?: AlertVariants;
      icon?: ReactElement;
    };
    drawer: {
      children: ReactNode | ReactNode[];
    };
    cookieConsent: true;
    networkDetectorOffline: true;
    networkDetectorOnline: true;
    info: false;
    error: false;
    success: false;
    warning: false;
  }
}
