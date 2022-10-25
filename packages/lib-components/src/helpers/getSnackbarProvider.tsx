import { FC, PropsWithChildren } from 'react';
import { SnackbarProvider as Provider, SnackbarProviderProps } from 'notistack';
import {
  DefaultSnack,
  DrawerSnack,
  NetworkDetectorOnlineSnack,
  NetworkDetectorOfflineSnack,
  CookieConsentSnack,
} from '../components/feedback/snacks';

const snackbarOptions: Partial<SnackbarProviderProps> = {
  anchorOrigin: {
    horizontal: 'center',
    vertical: 'top',
  },
  variant: 'default',
  autoHideDuration: 8000,
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

export const SnackbarProvider: FC<PropsWithChildren<unknown>> = ({
  children,
}) => <Provider {...snackbarOptions}>{children}</Provider>;

declare module 'notistack' {
  interface VariantOverrides {
    drawer: true;
    cookieConsent: true;
    networkDetectorOffline: true;
    networkDetectorOnline: true;
  }
}
