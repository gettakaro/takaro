import { FC, PropsWithChildren, ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { lightTheme, GlobalStyle } from '@takaro/lib-components';
import { ThemeProvider } from 'styled-components';
import { SnackbarProvider } from '../helpers';
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router';

const Providers: FC<PropsWithChildren<unknown>> = ({ children }) => {
  const rootRoute = createRootRoute({
    component: () => children,
  });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

  return (
    <ThemeProvider theme={lightTheme}>
      <SnackbarProvider>
        <GlobalStyle />
        <RouterProvider router={router} />
      </SnackbarProvider>
    </ThemeProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: Providers, ...options });

export * from '@testing-library/react';
export { customRender as render };
