import React from 'react';
import { ThemeProvider } from 'styled-components';
import { darkTheme } from '../src/styled';
import { GlobalStyle } from '../src/styled/GlobalStyle';
import { MemoryRouter } from 'react-router-dom';
import { SnackbarProvider } from '../src/helpers/getSnackbarProvider';
import { StepperProvider } from '../src/components/navigation/Steppers/context';
import 'simplebar-react/dist/simplebar.min.css';
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
