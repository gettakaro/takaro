import { ThemeProvider } from 'styled-components';
import { ThemeProvider as OryThemeProvider } from '@ory/elements';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GlobalStyle, SnackbarProvider, darkTheme } from '@takaro/lib-components';
// No changes needed
import { Router } from './Router';
import { useState } from 'react';
import { ConfigContext, TakaroConfig, getConfigVar } from 'context/configContext';
import { EnvVars } from 'EnvVars';

import '@ory/elements/style.css';
import { AxiosError } from 'axios';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // This is a temporary fix for the flashing behaviour in studio
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // retry 3 times (failureCount goes up on every fail)
        if ((error as AxiosError).response!.status >= 500 && failureCount <= 2) return true;
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
  const oryThemeOverrides = {
    fontFamily: 'Inter, sans-serif',
    accent: {
      def: darkTheme.colors.primary,
      muted: darkTheme.colors.primary,
      emphasis: darkTheme.colors.primary,
      disabled: darkTheme.colors.disabled,
      subtle: darkTheme.colors.backgroundAccent,
    },
    foreground: {
      def: darkTheme.colors.text,
      muted: darkTheme.colors.textAlt,
      subtle: darkTheme.colors.text,
      disabled: darkTheme.colors.disabled,
      onDark: darkTheme.colors.textAlt,
      onAccent: darkTheme.colors.text,
      onDisabled: darkTheme.colors.disabled,
    },
    background: {
      surface: darkTheme.colors.background,
      canvas: darkTheme.colors.backgroundAlt,
      subtle: darkTheme.colors.background,
    },
    error: {
      def: darkTheme.colors.error,
      subtle: darkTheme.colors.error,
      muted: darkTheme.colors.error,
      emphasis: darkTheme.colors.error,
    },
    success: {
      emphasis: darkTheme.colors.primary,
    },
    border: {
      def: darkTheme.colors.background,
    },
    text: {
      def: darkTheme.colors.text,
      disabled: darkTheme.colors.disabled,
    },
    input: {
      background: darkTheme.colors.placeholder,
      disabled: darkTheme.colors.disabled,
      placeholder: darkTheme.colors.placeholder,
      text: darkTheme.colors.text,
    },
  };

<<<<<<< HEAD
=======
  const oryThemeOverrides = {
    fontFamily: 'Inter, sans-serif',
    accent: {
      def: darkTheme.colors.primary,
      muted: darkTheme.colors.primary,
      emphasis: darkTheme.colors.primary,
      disabled: darkTheme.colors.disabled,
      subtle: darkTheme.colors.backgroundAccent,
    },
    foreground: {
      def: darkTheme.colors.text,
      muted: darkTheme.colors.textAlt,
      subtle: darkTheme.colors.text,
      disabled: darkTheme.colors.disabled,
      onDark: darkTheme.colors.textAlt,
      onAccent: darkTheme.colors.text,
      onDisabled: darkTheme.colors.disabled,
    },
    background: {
      surface: darkTheme.colors.background,
      canvas: darkTheme.colors.backgroundAlt,
      subtle: darkTheme.colors.background,
    },
    error: {
      def: darkTheme.colors.error,
      subtle: darkTheme.colors.error,
      muted: darkTheme.colors.error,
      emphasis: darkTheme.colors.error,
    },
    success: {
      emphasis: darkTheme.colors.primary,
    },
    border: {
      def: darkTheme.colors.background,
    },
    text: {
      def: darkTheme.colors.text,
      disabled: darkTheme.colors.disabled,
    },
    input: {
      background: darkTheme.colors.placeholder,
      disabled: darkTheme.colors.disabled,
      placeholder: darkTheme.colors.placeholder,
      text: darkTheme.colors.text,
    },
  };

>>>>>>> origin/main
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
              <ReactQueryDevtools initialIsOpen={false} position="top-left" />
            </QueryClientProvider>
          </SnackbarProvider>
        </ConfigContext.Provider>
      </ThemeProvider>
    </OryThemeProvider>
  );
}
              <ReactQueryDevtools initialIsOpen={false} position="top-left" />
            </QueryClientProvider>
          </SnackbarProvider>
        </ConfigContext.Provider>
      </ThemeProvider>
    </OryThemeProvider>
  );
}

export default App;
