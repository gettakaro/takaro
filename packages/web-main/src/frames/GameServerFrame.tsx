import { FC, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ErrorFallback, LoadingPage, styled } from '@takaro/lib-components';
import { Outlet } from 'react-router-dom';
import { Header } from 'components/Header';
import { Navbar, NavbarLink } from 'components/Navbar';
import { Page } from '../pages/Page';
import {
  AiOutlineAppstore as DashboardIcon,
  AiOutlineSetting as SettingsIcon,
  AiOutlineFunction as ModulesIcon,
  AiOutlineBook as DocumentationIcon,
} from 'react-icons/ai';
import { PATHS } from 'paths';
import { GameServerContext, GameServerData } from 'context/gameServerContext';
import { useParams, redirect } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  GameServerOutputDTO,
  GameServerOutputDTOTypeEnum,
} from '@takaro/apiclient';
import { useApiClient } from 'hooks/useApiClient';
import { ErrorBoundary } from '@sentry/react';
import { QueryKeys } from 'queryKeys';

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

// the default value is required to make the type checker happy.
const defaultGameServerData: GameServerData = {
  id: '',
  name: '',
  type: GameServerOutputDTOTypeEnum.Mock,
  createdAt: '',
  updatedAt: '',
  connectionInfo: {},
};

export const ServerFrame: FC = () => {
  const [gameServerData, setGameServerData] = useState<GameServerData>(
    defaultGameServerData
  );
  const { serverId } = useParams();
  const apiClient = useApiClient();

  console.log(serverId);
  // in case /server/**NOTHING**
  if (!serverId) {
    redirect(PATHS.gameServers.overview());
  }

  const { isLoading, isError } = useQuery<GameServerOutputDTO>({
    queryKey: QueryKeys.gameserver.id(serverId!),
    queryFn: async () =>
      (await apiClient.gameserver.gameServerControllerGetOne(serverId!)).data
        .data,
    onSuccess: (data: GameServerOutputDTO) => setGameServerData({ ...data }),
  });

  const providerGameServerData = useMemo(
    () => ({ gameServerData, setGameServerData }),
    [gameServerData, setGameServerData]
  );

  const links: NavbarLink[] = [
    {
      label: 'Server Dashboard',
      // If serverId is not valid it will be directed by the failed requests.
      path: PATHS.gameServer.dashboard(serverId!),
      icon: <DashboardIcon />,
    },
    {
      label: 'Server Modules',
      path: PATHS.gameServer.modules(serverId!),
      icon: <ModulesIcon />,
    },
    {
      label: 'Server Settings',
      path: PATHS.gameServer.settings(serverId!),
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
    <GameServerContext.Provider value={providerGameServerData}>
      <Container>
        <Navbar links={links} />
        <ContentContainer
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Header />
          <Page>
            <ErrorBoundary fallback={<ErrorFallback />}>
              {isLoading && <LoadingPage />}
              {isError ? <div>Server not found</div> : <Outlet />}
            </ErrorBoundary>
          </Page>
        </ContentContainer>
      </Container>
    </GameServerContext.Provider>
  );
};
