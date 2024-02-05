import { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { ThemeProvider as OryThemeProvider } from '@ory/elements';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GlobalStyle, SnackbarProvider, darkTheme } from '@takaro/lib-components';
import { oryThemeOverrides } from './OryThemeOverrides';
import { Router } from './Router';
import { isAxiosError } from 'axios';
import { ConfigContext, TakaroConfig, getConfigVar } from 'context/configContext';
import { EnvVars } from 'EnvVars';
import * as Sentry from '@sentry/react';

import '@ory/elements/style.css';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      throwOnError: (error) => {
        if (isAxiosError(error)) {
          if (error.response && error.response.status >= 500) {
            Sentry.captureException(error);
            return true;
          }
          return false;
        }
        Sentry.captureException(error);
        return true;
      },
      retry: (failureCount, error) => {
        // third try, capture the error
        if (failureCount === 3) {
          Sentry.captureException(error);
        }

        // SPECIAL CASE: if there is no `status`, this is `network error` meaning axios could not connect to the server at all
        if (isAxiosError(error) && error.status === undefined) {
          return false;
        }

        if (isAxiosError(error) && error.status && error.status >= 500 && failureCount <= 2) {
          return true;
        }
        return false;
      },
    },
  },
});

function App() {
  const [config, setConfig] = useState<TakaroConfig>();
  const [loading, setLoading] = useState<boolean>(true);

  // the config can be loaded before or after the app is loaded
  // if before window.__env__ will contain the env variables
  // if not we need to wait until the script is loaded
  const loadConfig = function () {
    const cfg = {
      apiUrl: getConfigVar(EnvVars.VITE_API),
      oryUrl: getConfigVar(EnvVars.VITE_ORY_URL),
    };
    setConfig(cfg as unknown as TakaroConfig);
    setLoading(false);
  };

  const configScriptElement = document.querySelector('#global-config') as HTMLScriptElement;
  if (!configScriptElement) throw new Error('Forgot the public .env?');
  configScriptElement.addEventListener('load', () => {
    loadConfig();
  });

  if (!config && window.__env__) loadConfig();
  if (loading) return <div>Loading...</div>;
  if (!config) throw new Error('Initialization error');

  return (
    <OryThemeProvider themeOverrides={oryThemeOverrides}>
      <ThemeProvider theme={darkTheme}>
        <ConfigContext.Provider value={config}>
          <SnackbarProvider>
            <QueryClientProvider client={queryClient}>
              <GlobalStyle />
              <Router />
              {
                // React query devtools are only included in bundles with NODE_ENV === 'development'.
                // No need to manually exclude them.
              }
              <ReactQueryDevtools initialIsOpen={false} position="bottom" buttonPosition="top-left" />
            </QueryClientProvider>
          </SnackbarProvider>
        </ConfigContext.Provider>
      </ThemeProvider>
    </OryThemeProvider>
  );
}

export default App;
