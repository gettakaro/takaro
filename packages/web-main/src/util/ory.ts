import { Configuration, FrontendApi } from '@ory/client-fetch';
import { getConfigVar } from '../util/getConfigVar';
import { OryClientConfiguration } from '@ory/elements-react';

export function getOryClient() {
  return new FrontendApi(
    new Configuration({
      basePath: getConfigVar('oryUrl'),
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    }),
  );
}

export const oryClientConfiguration: OryClientConfiguration = {
  sdk: {
    url: getConfigVar('oryUrl'),
  },
  name: 'Takaro',
  intl: {
    locale: 'en',
  },
  favicon: undefined,
  logoUrl: undefined,
  stylesheet: undefined,
  project: {
    login_ui_url: '/login',
    recovery_ui_url: '/account/recovery',
    verification_ui_url: '/account/verification',
    default_redirect_url: '/',
    recovery_enabled: true,
    registration_enabled: false,
    registration_ui_url: 'not-applicable',
    verification_enabled: true,
  },
};
