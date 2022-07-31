import { FC, ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { theme, GlobalStyle } from '@takaro/ui';
import { ThemeProvider } from 'styled-components';
import { SnackbarProvider } from '../helpers';
import { MemoryRouter } from 'react-router-dom';

const Providers: FC = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <MemoryRouter>
          <GlobalStyle />
          {children}
        </MemoryRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: Providers, ...options });

export * from '@testing-library/react';
export { customRender as render };
