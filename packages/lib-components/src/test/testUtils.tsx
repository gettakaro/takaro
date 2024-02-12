import { FC, PropsWithChildren, ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { lightTheme, GlobalStyle } from '@takaro/lib-components';
import { ThemeProvider } from 'styled-components';
import { SnackbarProvider } from '../helpers';

const Providers: FC<PropsWithChildren<unknown>> = ({ children }) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <SnackbarProvider>
        <GlobalStyle />
        {children}
      </SnackbarProvider>
    </ThemeProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: Providers, ...options });

export * from '@testing-library/react';
export { customRender as render };
