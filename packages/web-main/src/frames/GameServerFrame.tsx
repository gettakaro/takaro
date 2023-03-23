import { FC, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { styled } from '@takaro/lib-components';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from 'components/Header';
import { Navbar, NavbarLink } from 'components/Navbar';
import {
  AiOutlineAppstore as DashboardIcon,
  AiOutlineSetting as SettingsIcon,
  AiOutlineFunction as ModulesIcon,
} from 'react-icons/ai';
import { PATHS } from 'paths';
import { GameServerContext, GameServerData } from 'context/gameServerContext';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  GameServerOutputDTO,
  GameServerOutputDTOTypeEnum,
} from '@takaro/apiclient';
import { useApiClient } from 'hooks/useApiClient';
import { useSnackbar } from 'notistack';

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
const Page = styled.div`
  padding: 3rem 6rem;
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
  const navigate = useNavigate();
  const apiClient = useApiClient();
  const { enqueueSnackbar } = useSnackbar();

  const { isLoading } = useQuery<GameServerOutputDTO>(
    `gameserver/${serverId}`,
    async () => {
      return (await apiClient.gameserver.gameServerControllerGetOne(serverId!))
        .data.data;
    },
    {
      onSuccess: (data: GameServerOutputDTO) => setGameServerData({ ...data }),
      onError: () => {
        // TODO: we probably should show an error page instead of a snackbar, but fine for now
        enqueueSnackbar('Server not found', { variant: 'default' });
        navigate(PATHS.home());
      },
    }
  );

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
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
            <Outlet />
          </Page>
        </ContentContainer>
      </Container>
    </GameServerContext.Provider>
  );
};
