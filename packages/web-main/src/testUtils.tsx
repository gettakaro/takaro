import { ThemeProvider } from 'styled-components';
import { GlobalStyle, SnackbarProvider, darkTheme } from '@takaro/lib-components';
import { vi } from 'vitest';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import { FC, PropsWithChildren } from 'react';

window.scrollTo = () => {};

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => {
    return {
      navigate: () => {},
    };
  },
  Link: <a />,
}));

const providers: FC<PropsWithChildren> = ({ children }) => {
  // add portal for drawer
  const drawerPortalRoot = document.createElement('div');
  drawerPortalRoot.setAttribute('id', 'drawer');
  document.body.appendChild(drawerPortalRoot);

  // add portal for dialog
  const dialogPortalRoot = document.createElement('div');
  dialogPortalRoot.setAttribute('id', 'dialog');
  document.body.appendChild(dialogPortalRoot);

  // replace getComputedStyle with a mock that returns the values we need
  const { getComputedStyle } = window;
  window.getComputedStyle = (elt) => getComputedStyle(elt);

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
