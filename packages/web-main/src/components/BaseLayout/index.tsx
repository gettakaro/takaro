import { FC, PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { styled, getTransition } from '@takaro/lib-components';
import { Outlet } from '@tanstack/react-router';

const Page = styled(motion.div)`
  height: 100%;
  padding: ${({ theme }) => theme.spacing['2_5']};
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

interface BaseLayoutProps {
  showGameServerNav: boolean;
}

export const BaseLayout: FC<PropsWithChildren<BaseLayoutProps>> = ({ showGameServerNav }) => {
  return (
    <Container>
      <Navbar showGameServerNav={showGameServerNav} />
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
  );
};
