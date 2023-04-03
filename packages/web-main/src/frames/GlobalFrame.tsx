import { FC } from 'react';
import { motion } from 'framer-motion';
import { ErrorFallback, styled } from '@takaro/lib-components';
import { Outlet } from 'react-router-dom';
import { Header } from 'components/Header';
import { Navbar } from 'components/Navbar';
import {
  AiOutlineAppstore as DashboardIcon,
  AiOutlineSetting as SettingsIcon,
  AiOutlineFunction as ModulesIcon,
  AiOutlineDatabase as GameServersIcon,
  AiOutlineBook as DocumentationIcon,
  // AiOutlineUser as UsersIcon,
  AiOutlineIdcard as PlayersIcon,
} from 'react-icons/ai';
import { NavbarLink } from 'components/Navbar';
import { PATHS } from 'paths';
import { Page } from '../pages/Page';
import { ErrorBoundary } from '@sentry/react';

const Container = styled.div`
  display: flex;
  height: 100%;
`;

const ContentContainer = styled(motion.div)`
  background-color: ${({ theme }): string => theme.colors.background};
  width: 100%;
  opacity: 0;
  overflow-y: auto;
`;

export const GlobalFrame: FC = () => {
  const links: NavbarLink[] = [
    {
      label: 'Dashboard',
      path: PATHS.home(),
      icon: <DashboardIcon />,
    },
    {
      label: 'Servers',
      path: PATHS.gameServers.overview(),
      icon: <GameServersIcon />,
    },
    {
      label: 'Players',
      path: PATHS.players(),
      icon: <PlayersIcon />,
    },
    /*
    {
      label: 'Users',
      path: PATHS.users(),
      icon: <UsersIcon />,
    },
    */
    {
      label: 'Modules',
      path: PATHS.moduleDefinitions(),
      icon: <ModulesIcon />,
    },
    {
      label: 'Settings',
      path: PATHS.settings(),
      icon: <SettingsIcon />,
    },
    {
      label: 'Documentation',
      path: 'https://docs.takaro.io',
      icon: <DocumentationIcon />,
      external: true,
    },
  ];

  return (
    <Container>
      <Navbar links={links} />
      <ContentContainer
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Header />
        <ErrorBoundary fallback={<ErrorFallback />}>
          <Page>
            <Outlet />
          </Page>
        </ErrorBoundary>
      </ContentContainer>
    </Container>
  );
};
