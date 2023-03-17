import { ThemeProvider } from 'styled-components';
import { Helmet } from 'react-helmet';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import {
  GlobalStyle,
  SnackbarProvider,
  darkTheme,
} from '@takaro/lib-components';
import { Router } from 'Router';
import { useMemo, useState } from 'react';
import { UserContext, UserData } from 'context/userContext';
import { AuthContext, AuthProvider } from 'context/authContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // This is a temporary fix for the flashing behaviour in studio
      refetchOnWindowFocus: false,
    },
  },
});

const defaultUserData: UserData = {
  id: null,
  email: null,
  name: null,
};

function App() {
  const [userData, setUserData] = useState<Partial<UserData>>(defaultUserData);

  const providerUserData = useMemo(
    () => ({ userData, setUserData }),
    [userData, setUserData]
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <UserContext.Provider value={providerUserData}>
        <SnackbarProvider>
          <AuthContext.Provider value={AuthProvider()}>
            <QueryClientProvider client={queryClient}>
              <GlobalStyle />
              <Helmet>
                <meta charSet="UTF-8" />
                <base href="/" />
                <meta content="ie=edge" httpEquiv="X-UA-Compatible" />
                <meta content="true" name="HandHeldFriendly" />
                <meta content="index, follow" name="robots" />
                <meta content="takaro.io" name="author" />
                <meta content="takaro.io" name="designer" />
                <meta content="takaro" name="copyright" />
                <meta
                  content="Takaro is a web based gameserver manager. Bring your server(s) to the next level with Takaros advanced features! Join hundreds of other servers in a new generation of server management."
                  name="description"
                />
                <meta
                  content="server manager, web, cloud, open source, csmm, Catalysm, 7 Days to Die server manager,7 Days to Die, Rust, monitor"
                  name="keywords"
                />
                <title>Takaro</title>
                <link href="https://takaro.io/" rel="canonical" />
              </Helmet>
              <Router />
              {
                // React query devtools are only included in bundles with NODE_ENV === 'development'.
                // No need to manually exclude them.
              }
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </AuthContext.Provider>
        </SnackbarProvider>
      </UserContext.Provider>
    </ThemeProvider>
  );
}

export default App;
