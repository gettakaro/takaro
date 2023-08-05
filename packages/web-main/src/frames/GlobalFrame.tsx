import { FC } from 'react';
import { motion } from 'framer-motion';
import { ErrorFallback, styled, useLocalStorage } from '@takaro/lib-components';
import { Outlet, useOutletContext } from 'react-router-dom';
import { Header } from 'components/Header';
import { Navbar } from 'components/Navbar';
import { useParams } from 'react-router-dom';

import { Page } from '../pages/Page';
import { ErrorBoundary } from '@sentry/react';
import { useGameServer } from 'queries/gameservers';

const Container = styled.div`
  display: flex;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
`;

const ContentContainer = styled(motion.div)`
  background-color: ${({ theme }): string => theme.colors.background};
  margin-top: ${({ theme }) => theme.spacing[1]};
  border-left: 1px solid ${({ theme }) => theme.colors.secondary};
  border-top: 1px solid ${({ theme }) => theme.colors.secondary};
  border-top-left-radius: ${({ theme }) => theme.borderRadius.large};
  width: 100%;
  opacity: 0;
  overflow-y: auto;
`;

export function useGameServerOutletContext() {
  return useOutletContext<{ gameServerId: string; setGameServerId: (value: string) => void }>();
}

export const GlobalFrame: FC = () => {
  const [gameServerId, setGameServerId] = useLocalStorage<string>('selectedGameServerId', '');
  const { serverId: pathServerId } = useParams();

  const { isLoading, data: gameserver } = useGameServer(gameServerId);

  if (pathServerId && pathServerId !== gameServerId) {
    setGameServerId(pathServerId);
  }

  return (
    <Container>
      <Navbar gameServerId={gameServerId} setGameServerId={setGameServerId} />
      <ContentContainer animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
        <Header isLoading={isLoading} idToNameMap={gameserver ? { [gameServerId]: gameserver.name } : undefined} />
        <ErrorBoundary fallback={<ErrorFallback />}>
          <Page>
            <Outlet context={{ gameServerId: gameServerId, setGameServerId }} />
          </Page>
        </ErrorBoundary>
      </ContentContainer>
    </Container>
  );
};
