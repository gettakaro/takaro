import { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GlobalStyle, SnackbarProvider, darkTheme } from '@takaro/lib-components';
import { queryClient } from './queryClient';

import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { getConfigVar } from 'util/getConfigVar';

// Adds the typesafety to all @tanstack/react-router components.
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
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
    <ThemeProvider theme={darkTheme}>
      <SnackbarProvider>
        <QueryClientProvider client={queryClient}>
          <GlobalStyle />
          <RouterProvider router={router} />;
          <ReactQueryDevtools initialIsOpen={false} position="bottom" buttonPosition="bottom-left" />
        </QueryClientProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
