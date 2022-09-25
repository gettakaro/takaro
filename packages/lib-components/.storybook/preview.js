import { ThemeProvider } from 'styled-components';
import { theme } from '../src/styled/theme';
import { GlobalStyle } from '../src/styled/GlobalStyle';
import { MemoryRouter } from 'react-router-dom';
import { SnackbarProvider } from '../src/helpers/getSnackbarProvider';
import { StepperProvider } from '../src/components/navigation/Steppers/context';
import 'simplebar-react/dist/simplebar.min.css';


export const decorators = [
  (Story) => (
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={['/']}>
        <SnackbarProvider>
          <StepperProvider>
            <GlobalStyle />
            <Story />
          </StepperProvider>
        </SnackbarProvider>
      </MemoryRouter>
    </ThemeProvider>
  )
];

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' }
};
