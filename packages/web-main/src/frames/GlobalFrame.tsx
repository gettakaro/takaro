import { FC } from 'react';
import { motion } from 'framer-motion';
import { ErrorFallback, styled, useLocalStorage } from '@takaro/lib-components';
import { Outlet } from 'react-router-dom';
import { Navbar } from 'components/Navbar';
import { useParams } from 'react-router-dom';

import { Page } from '../pages/Page';
import { ErrorBoundary } from '@sentry/react';
import { SelectedGameServerContext } from 'context/selectedGameServerContext';

const Container = styled.div`
  display: flex;
  height: calc(100vh - 1.2rem);
  background-color: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`;

const ContentContainer = styled(motion.div)`
  background-color: ${({ theme }): string => theme.colors.background};
  margin-top: ${({ theme }) => theme.spacing[1]};
  border-left: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  border-top: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  border-top-left-radius: ${({ theme }) => theme.borderRadius.large};
  width: 100%;
  opacity: 0;
  overflow-y: auto;
`;

export const GlobalFrame: FC = () => {
  const { storedValue: gameServerId, setValue: setGameServerId } = useLocalStorage<string>('selectedGameServerId', '');
  const { serverId: pathServerId } = useParams();

  // a new serverId was passed in the URL.
  if (pathServerId && pathServerId !== gameServerId) {
    setGameServerId(pathServerId);
  }

  return (
    <SelectedGameServerContext.Provider
      value={{ selectedGameServerId: gameServerId, setSelectedGameServerId: setGameServerId }}
    >
      <Container>
        <Navbar />
        <ContentContainer animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
          <ErrorBoundary fallback={<ErrorFallback />}>
            <Page>
              <Outlet context={{ gameServerId: gameServerId, setGameServerId }} />
            </Page>
          </ErrorBoundary>
        </ContentContainer>
      </Container>
    </SelectedGameServerContext.Provider>
  );
};
