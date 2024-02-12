import { FC, useMemo } from 'react';
import { NavbarLink, renderLink } from '.';
import { GameServerSelectNav } from './GameServerSelectNav';
import { Button } from '@takaro/lib-components';
import { PERMISSIONS } from '@takaro/apiclient';
import { useNavigate } from '@tanstack/react-router';
import {
  AiOutlineAppstore as DashboardIcon,
  AiOutlineSetting as SettingsIcon,
  AiOutlineFunction as ModulesIcon,
  AiOutlinePlus as AddServerIcon,
} from 'react-icons/ai';
import { gameServersOptions } from 'queries/gameservers';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { Nav, NoServersCallToAction } from './style';
import { useQuery } from '@tanstack/react-query';

// this needs to be separated from the rest of the navbar because it depends on the READ_GAMESERVERS permission.
// Since the data hook is otherwise at the top level, it would result in an unwanted 401/403 response.
export const GameServerNav: FC = () => {
  const navigate = useNavigate();
  const { data } = useQuery(gameServersOptions({}));
  const { selectedGameServerId, setSelectedGameServerId } = useSelectedGameServer();

  const gameServerLinks: NavbarLink[] = useMemo(() => {
    return [
      {
        label: 'Dashboard',
        // If serverId is not valid it will be directed by the failed requests.

        linkProps: {
          to: '/gameserver/$gameServerId/dashboard/overview',
          params: { gameServerId: selectedGameServerId },
        },
        icon: <DashboardIcon />,
        requiredPermissions: [PERMISSIONS.ReadGameservers],
      },
      {
        label: 'Modules',
        linkProps: {
          to: '/gameserver/$gameServerId/modules',
          params: { gameServerId: selectedGameServerId },
        },
        icon: <ModulesIcon />,
        requiredPermissions: [PERMISSIONS.ReadGameservers, PERMISSIONS.ReadModules],
      },
      {
        label: 'Settings',
        linkProps: {
          to: '/gameserver/$gameServerId/settings',
          params: { gameServerId: selectedGameServerId },
        },
        icon: <SettingsIcon />,
        requiredPermissions: [PERMISSIONS.ReadSettings, PERMISSIONS.ReadGameservers],
      },
    ];
  }, [selectedGameServerId]);

  // TODO: not sure how to handle this yet.
  // const isInGameServerNav = gameServerLinks.some((link) => location.pathname.includes(link.path));

  return (
    <Nav data-testid="server-nav">
      {data && data.data.length > 0 ? (
        <>
          <h3>Server</h3>
          <GameServerSelectNav
            isInGameServerNav={false}
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
              onClick={() => navigate({ to: '/gameservers/create' })}
              text="Add a server"
            />
          </NoServersCallToAction>
        </>
      )}
    </Nav>
  );
};
