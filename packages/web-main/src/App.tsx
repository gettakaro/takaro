import { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { ThemeProvider as OryThemeProvider } from '@ory/elements';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GlobalStyle, SnackbarProvider, darkTheme } from '@takaro/lib-components';
import { oryThemeOverrides } from './OryThemeOverrides';
import { Router } from './Router';
import { ConfigContext, TakaroConfig, getConfigVar } from 'context/configContext';
import { EnvVars } from 'EnvVars';
import '@ory/elements/style.css';
import { queryClient } from './queryClient';

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
