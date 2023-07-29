import { ThemeProvider } from 'styled-components';
import { ThemeProvider as OryThemeProvider } from '@ory/elements';
import { Helmet } from 'react-helmet';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GlobalStyle, SnackbarProvider, darkTheme } from '@takaro/lib-components';
import { Router } from './Router';
import { useMemo, useState } from 'react';
import { UserContext } from 'context/userContext';
import { ConfigContext, TakaroConfig, getConfigVar } from 'context/configContext';
import { EnvVars } from 'EnvVars';
import { UserOutputDTO } from '@takaro/apiclient';

import '@ory/elements/style.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // This is a temporary fix for the flashing behaviour in studio
      refetchOnWindowFocus: false,
    },
  },
});

const defaultUserData: Partial<UserOutputDTO> = {
  id: undefined,
  email: undefined,
  name: undefined,
};

function App() {
  const [userData, setUserData] = useState<Partial<UserOutputDTO>>(defaultUserData);
  const [config, setConfig] = useState<TakaroConfig>();
  const [loading, setLoading] = useState<boolean>(true);

  const providerUserData = useMemo(() => ({ userData, setUserData }), [userData, setUserData]);

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

  const oryThemeOverrides = {
    fontFamily: 'Inter, sans-serif',
    accent: {
      def: darkTheme.colors.primary,
      muted: darkTheme.colors.primary,
      emphasis: darkTheme.colors.primary,
      disabled: darkTheme.colors.disabled,
      subtle: darkTheme.colors.tertiary,
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
      subtle: darkTheme.colors.gray,
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

  return (
    <ThemeProvider theme={darkTheme}>
      <OryThemeProvider themeOverrides={oryThemeOverrides}>
        <UserContext.Provider value={providerUserData}>
          <ConfigContext.Provider value={config}>
            <SnackbarProvider>
              <QueryClientProvider client={queryClient}>
                <GlobalStyle />
                <Helmet>
                  <meta charSet="UTF-8" />
                  <base href="/" />
                  <meta content="ie=edge" httpEquiv="X-UA-Compatible" />
                  <meta content="true" name="HandHeldFriendly" />
                  <meta content="index, follow" name="robots" />
                  <meta content="takaro.io" name="author" />
                  <meta content="takaro.io" name="designer" />
                  <meta content="takaro" name="copyright" />
                  <meta
                    content="Takaro is a web based gameserver manager. Bring your server(s) to the next level with Takaro's advanced features! Join hundreds of other servers in a new generation of server management."
                    name="description"
                  />
                  <meta
                    content="server manager, web, cloud, open source, Takaro, 7 Days to Die server manager,7 Days to Die, Rust, monitor"
                    name="keywords"
                  />
                  <title>Takaro</title>
                  <link href="https://takaro.io/" rel="canonical" />
                </Helmet>
                <Router />
                {
                  // React query devtools are only included in bundles with NODE_ENV === 'development'.
                  // No need to manually exclude them.
                }
                <ReactQueryDevtools initialIsOpen={false} />
              </QueryClientProvider>
            </SnackbarProvider>
          </ConfigContext.Provider>
        </UserContext.Provider>
      </OryThemeProvider>
    </ThemeProvider>
  );
}

export default App;
