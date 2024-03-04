import { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { ThemeProvider as OryThemeProvider } from '@ory/elements';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GlobalStyle, SnackbarProvider, darkTheme } from '@takaro/lib-components';
import { oryThemeOverrides } from './OryThemeOverrides';
import '@ory/elements/style.css';
import { queryClient } from './queryClient';

import { RouterProvider } from '@tanstack/react-router';
import { OryProvider } from 'hooks/useOry';
import { AuthProvider, useAuth } from 'hooks/useAuth';
import { router } from './router';
import { getConfigVar } from 'util/getConfigVar';

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
  const [hasLoadedConfig, setHasLoadedConfig] = useState<boolean>(true);

  // the config can be loaded before or after the app is loaded
  // if before window.__env__ will contain the env variables
  // if not we need to wait until the script is loaded
  const configScriptElement = document.querySelector('#global-config') as HTMLScriptElement;
  if (!configScriptElement) throw new Error('Forgot the public .env?');

  configScriptElement.addEventListener('load', () => {
    if (window.__env__ && !hasLoadedConfig) {
      getConfigVar('apiUrl');
      setHasLoadedConfig(false);
    }
  });

  if (!hasLoadedConfig && window.__env__) {
    getConfigVar('apiUrl');
    setHasLoadedConfig(true);
  }

  return (
    <OryThemeProvider themeOverrides={oryThemeOverrides}>
      <ThemeProvider theme={darkTheme}>
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
    </OryThemeProvider>
  );
}
