import React from 'react';
import { ThemeProvider } from 'styled-components';
import { darkTheme } from '../packages/lib-components/src/styled';
import { GlobalStyle } from '../packages/lib-components/src/styled/GlobalStyle';
import { StepperProvider } from '../packages/lib-components/src/components/navigation/Steppers/context';
import { SnackbarProvider } from '../packages/lib-components/src/helpers/getSnackbarProvider';
import 'simplebar-react/dist/simplebar.min.css';
import { Preview } from '@storybook/react';

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
      return (
        <ThemeProvider theme={darkTheme}>
          <SnackbarProvider>
            <StepperProvider>
              <GlobalStyle />
              <Story />
            </StepperProvider>
          </SnackbarProvider>
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
