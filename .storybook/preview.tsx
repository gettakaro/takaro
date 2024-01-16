import React, { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { darkTheme } from '../packages/lib-components/src/styled';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ThemeProvider as OryThemeProvider } from '@ory/elements';
import { GlobalStyle } from '../packages/lib-components/src/styled/GlobalStyle';
import { StepperProvider } from '../packages/lib-components/src/components/navigation/Steppers/context';
import { SnackbarProvider } from '../packages/lib-components/src/helpers/getSnackbarProvider';
import 'simplebar-react/dist/simplebar.min.css';
import { MemoryRouter } from 'react-router-dom';
import 'rc-slider/assets/index.css';
import { Preview } from '@storybook/react';
import { getConfigVar, ConfigContext, TakaroConfig } from '../packages/web-main/src/context/configContext';
import { EnvVars } from '../packages/web-main/src/EnvVars';
import { oryThemeOverrides } from '../packages/web-main/src/OryThemeOverrides';
import { AxiosError } from 'axios';
import { Client } from '@takaro/apiclient';

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

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    options: {
      storySort: {
        order: ['Design System', ['Introduction', 'Colors', 'Spacing', 'Elevation'], 'Lib Components', 'Web Main'],
      },
    },
  },
  decorators: [
    (Story) => {
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

      const client = new Client({
        auth: {},
        url: config?.apiUrl!,
      });

      useEffect(() => {
        if (client) {
          client.user
            .userControllerLogin({
              username: 'takaro@localdev.local',
              password: 'takaro_is_cool',
            })
            .then((res) => {
              console.log('this is the token', res.data.data.token);
            })
            .catch((err) => {
              console.error('this fired', err);
            });
        }
      }, [client]);

      if (!config && window.__env__) loadConfig();
      if (loading) return <div>Loading...</div>;

      if (!config) throw new Error('Initialization error');

      return (
        <OryThemeProvider themeOverrides={oryThemeOverrides}>
          <ThemeProvider theme={darkTheme}>
            <MemoryRouter initialEntries={['/']}>
              <ConfigContext.Provider value={config}>
                <SnackbarProvider>
                  <QueryClientProvider client={queryClient}>
                    <StepperProvider>
                      <GlobalStyle />
                      <Story />
                    </StepperProvider>
                  </QueryClientProvider>
                </SnackbarProvider>
              </ConfigContext.Provider>
            </MemoryRouter>
          </ThemeProvider>
        </OryThemeProvider>
      );
    },
  ],
};

export default preview;
