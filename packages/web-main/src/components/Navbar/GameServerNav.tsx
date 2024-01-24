import { FC, useMemo } from 'react';
import { NavbarLink, renderLink } from '.';
import { GameServerSelectNav } from './GameServerSelectNav';
import { Button } from '@takaro/lib-components';
import { PERMISSIONS } from '@takaro/apiclient';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AiOutlineAppstore as DashboardIcon,
  AiOutlineSetting as SettingsIcon,
  AiOutlineFunction as ModulesIcon,
  AiOutlinePlus as AddServerIcon,
} from 'react-icons/ai';
import { PATHS } from 'paths';
import { useGameServers } from 'queries/gameservers';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { Nav, NoServersCallToAction } from './style';

// this needs to be separated from the rest of the navbar because it depends on the READ_GAMESERVERS permission.
// Since the data hook is otherwise at the top level, it would result in an unwanted 401/403 response.
export const GameServerNav: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { data } = useGameServers();
  const { selectedGameServerId, setSelectedGameServerId } = useSelectedGameServer();

  const gameServerLinks: NavbarLink[] = useMemo(() => {
    return [
      {
        label: 'Dashboard',
        // If serverId is not valid it will be directed by the failed requests.
        path: PATHS.gameServer.dashboard.overview(selectedGameServerId),
        icon: <DashboardIcon />,
        requiredPermissions: [PERMISSIONS.ReadGameservers],
      },
      {
        label: 'Modules',
        path: PATHS.gameServer.modules(selectedGameServerId),
        icon: <ModulesIcon />,
        requiredPermissions: [PERMISSIONS.ReadGameservers, PERMISSIONS.ReadModules],
      },
      {
        label: 'Settings',
        path: PATHS.gameServer.settings(selectedGameServerId),
        icon: <SettingsIcon />,
        requiredPermissions: [PERMISSIONS.ReadSettings, PERMISSIONS.ReadGameservers],
      },
    ];
  }, [selectedGameServerId]);

  const isInGameServerNav = gameServerLinks.some((link) => location.pathname.includes(link.path));

  return (
    <Nav data-testid="server-nav">
      {data && data.pages[0].data.length > 0 ? (
        <>
          <h3>Server</h3>
          <GameServerSelectNav
            isInGameServerNav={isInGameServerNav}
            serverId={selectedGameServerId}
            setServerId={setSelectedGameServerId}
          />
          {gameServerLinks.map((link) => renderLink(link))}
        </>
      ) : (
        <>
          <h3>Server</h3>
          <NoServersCallToAction
            initial={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p>Step into the world of Takaro by adding your first server!</p>
            <Button
              icon={<AddServerIcon />}
              fullWidth
              onClick={() => navigate(PATHS.gameServers.create())}
              text="Add a server"
            />
          </NoServersCallToAction>
        </>
      )}
    </Nav>
  );
};
