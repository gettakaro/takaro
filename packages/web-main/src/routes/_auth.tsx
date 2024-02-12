import { createFileRoute, redirect } from '@tanstack/react-router';
import { styled, useLocalStorage, getTransition } from '@takaro/lib-components';
import { Outlet } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Navbar } from 'components/Navbar';
import { ErrorBoundary } from 'components/ErrorBoundary';
import { SelectedGameServerContext } from 'hooks/useSelectedGameServerContext';

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context: { auth } }) => {
    if (auth && auth.isAuthenticated === false) {
      throw redirect({ to: '/login' });
    }
  },
  component: Component,
});

const Page = styled(motion.div)`
  height: 100%;
  padding: 5rem;
`;

const animations = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

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

function Component() {
  const { storedValue: gameServerId, setValue: setGameServerId } = useLocalStorage<string>('selectedGameServerId', '');

  // TODO: basically when we detect a change a gameserverId as one of the URL params, we should update the context
  // because the gameserverId is used in the nav, even on pages that don't directly rely on the gameserver.
  /*  
  if (pathServerId && pathServerId !== gameServerId) {
    setGameServerId(pathServerId);
  }
  */

  return (
    <SelectedGameServerContext.Provider
      value={{ selectedGameServerId: gameServerId, setSelectedGameServerId: setGameServerId }}
    >
      <Container>
        <Navbar />
        <ContentContainer animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
          <ErrorBoundary>
            <Page
              animate="animate"
              initial="initial"
              transition={{
                ...getTransition(),
              }}
              variants={animations}
            >
              <Outlet />
            </Page>
          </ErrorBoundary>
        </ContentContainer>
      </Container>
    </SelectedGameServerContext.Provider>
  );
}
