import React from 'react';
import { ThemeProvider } from 'styled-components';
import { darkTheme } from '../packages/lib-components/src/styled';
import { GlobalStyle } from '../packages/lib-components/src/styled/GlobalStyle';
import { StepperProvider } from '../packages/lib-components/src/components/navigation/Steppers/context';
import { SnackbarProvider } from '../packages/lib-components/src/helpers/getSnackbarProvider';
import 'simplebar-react/dist/simplebar.min.css';
import { MemoryRouter } from 'react-router-dom';
import 'rc-slider/assets/index.css';
import { Preview } from '@storybook/react';

export default {
  decorators: [
    (Story) => (
      <ThemeProvider theme={darkTheme}>
        <MemoryRouter initialEntries={['/']}>
          <SnackbarProvider>
            <StepperProvider>
              <GlobalStyle />
              <Story />
            </StepperProvider>
          </SnackbarProvider>
        </MemoryRouter>
      </ThemeProvider>
    ),
  ],
} as Preview;
