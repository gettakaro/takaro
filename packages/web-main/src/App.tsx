import { ThemeProvider } from 'styled-components';
import { MemoryRouter } from 'react-router-dom';

import {
  Divider,
  GlobalStyle,
  Loading,
  SnackbarProvider,
  StepperProvider,
  styled,
  theme,
} from '@takaro/lib-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`

function App() {
  return (
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={['/']}>
        <SnackbarProvider>
          <StepperProvider>
          <GlobalStyle />

            <Container className="App">
                <Loading />
                <Divider spacing='huge'/>
                <p>
                  Coming soon...
                </p>
            </Container>
          </StepperProvider>
        </SnackbarProvider>
      </MemoryRouter>
    </ThemeProvider>
  );
}

export default App;
