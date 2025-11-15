import { useState, useEffect } from 'react';
import { ThemeProvider as OryThemeProvider, IntlProvider as OryIntlProvider } from '@ory/elements';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GlobalStyle, SnackbarProvider, ThemeProvider } from '@takaro/lib-components';
import { oryThemeOverrides } from './OryThemeOverrides';
import '@ory/elements/style.css';
import { queryClient } from './queryClient';
import { PostHogProvider } from 'posthog-js/react';

import { RouterProvider } from '@tanstack/react-router';
import { OryProvider } from './hooks/useOry';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { router } from './router';
import { getConfigVar } from './util/getConfigVar';

// Adds the typesafety to all @tanstack/react-router components.
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function InnerApp() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

export function App() {
  const [hasLoadedConfig, setHasLoadedConfig] = useState<boolean>(false);

  // the config can be loaded before or after the app is loaded
  // if before window.__env__ will contain the env variables
  // if not we need to wait until the script is loaded
  useEffect(() => {
    const configScriptElement = document.querySelector('#global-config') as HTMLScriptElement;
    if (!configScriptElement) throw new Error('Forgot the public .env?');
    if (window.__env__) {
      setHasLoadedConfig(true);
      return;
    }
    // Otherwise, wait for script to load
    const handleLoad = () => {
      if (window.__env__) {
        setHasLoadedConfig(true);
      }
    };

    configScriptElement.addEventListener('load', handleLoad);
    return () => {
      configScriptElement.removeEventListener('load', handleLoad);
    };
  }, []);

  if (!hasLoadedConfig) {
    return <></>;
  }

  return (
    <PostHogProvider
      apiKey={getConfigVar('posthogPublicApiKey')}
      options={{
        api_host: getConfigVar('posthogApiUrl'),
        person_profiles: 'always',
      }}
    >
      <OryThemeProvider themeOverrides={oryThemeOverrides}>
        <OryIntlProvider>
          <ThemeProvider>
            <SnackbarProvider>
              <QueryClientProvider client={queryClient}>
                <OryProvider>
                  <AuthProvider>
                    <GlobalStyle />
                    <InnerApp />
                    <ReactQueryDevtools initialIsOpen={false} position="bottom" buttonPosition="bottom-left" />
                  </AuthProvider>
                </OryProvider>
              </QueryClientProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </OryIntlProvider>
      </OryThemeProvider>
    </PostHogProvider>
  );
}
