import { ThemeProvider } from 'styled-components';
import { GlobalStyle, SnackbarProvider, darkTheme } from '@takaro/lib-components';

import { render, RenderOptions } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from 'App';
import { FC, PropsWithChildren } from 'react';

const providers: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ThemeProvider theme={darkTheme}>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <GlobalStyle />
          {children}
        </SnackbarProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: providers, ...options });

export * from '@testing-library/react';
export { customRender as render };
