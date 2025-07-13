import { FC, useMemo } from 'react';
import { NavbarLink } from '.';
import { renderLink } from './renderLink';
import { GlobalGameServerSelect } from './GlobalGameServerSelect';
import { Button, Skeleton } from '@takaro/lib-components';
import { PERMISSIONS } from '@takaro/apiclient';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import {
  AiOutlineAppstore as DashboardIcon,
  AiOutlineSetting as SettingsIcon,
  AiOutlineFunction as ModulesIcon,
  AiOutlinePlus as AddServerIcon,
  AiOutlineShopping as ShopIcon,
  AiOutlineIdcard as PlayersIcon,
} from 'react-icons/ai';
import { gameServersQueryOptions } from '../../queries/gameserver';
import { Nav, NoServersCallToAction } from './style';
import { useQuery } from '@tanstack/react-query';

const route = getRouteApi('/_auth/gameserver/$gameServerId');

interface GameServerNavProps {
  isCollapsed?: boolean;
}

export const GameServerNav: FC<GameServerNavProps> = ({ isCollapsed = false }) => {
  const navigate = useNavigate();
  const { data: gameservers, isPending } = useQuery(gameServersQueryOptions());
  const { gameServerId } = route.useParams();

  const gameServerLinks: NavbarLink[] = useMemo(() => {
    return [
      {
        label: 'Dashboard',
        linkProps: {
          to: '/gameserver/$gameServerId/dashboard/overview',
          params: { gameServerId: gameServerId },
        },
        icon: <DashboardIcon />,
        requiredPermissions: [PERMISSIONS.ManageGameservers],
      },
      {
        label: 'Players',
        linkProps: {
          to: '/gameserver/$gameServerId/dashboard/players',
          params: { gameServerId: gameServerId },
        },
        icon: <PlayersIcon />,
        requiredPermissions: [PERMISSIONS.ReadPlayers],
      },
      {
        label: 'Shop & Orders',
        linkProps: {
          to: '/gameserver/$gameServerId/shop',
          params: { gameServerId: gameServerId },
        },
        icon: <ShopIcon />,
        requiredPermissions: [],
      },
      {
        label: 'Modules',
        linkProps: {
          to: '/gameserver/$gameServerId/modules',
          params: { gameServerId: gameServerId },
        },
        icon: <ModulesIcon />,
        requiredPermissions: [PERMISSIONS.ReadModules],
      },
      {
        label: 'Settings',
        linkProps: {
          to: '/gameserver/$gameServerId/settings',
          params: { gameServerId: gameServerId },
        },
        icon: <SettingsIcon />,
        requiredPermissions: [PERMISSIONS.ReadSettings],
      },
    ];
  }, [gameServerId]);

  if (isPending) {
    return (
      <Nav data-testid="server-nav" $isCollapsed={isCollapsed}>
        <h3 style={{ visibility: isCollapsed ? 'hidden' : 'visible' }}>Game Server</h3>
        <div style={{ visibility: isCollapsed ? 'hidden' : 'visible' }}>
          <Skeleton variant="text" width="100%" height="35px" />
        </div>
        {gameServerLinks.map((link) => renderLink(link, isCollapsed))}
      </Nav>
    );
  }

  return (
    <Nav data-testid="server-nav" $isCollapsed={isCollapsed}>
      {gameServerId && gameServerId !== '' && gameservers && gameservers.data.length > 0 ? (
        <>
          <h3 style={{ visibility: isCollapsed ? 'hidden' : 'visible' }}>Game Server</h3>
          <div
            style={{
              visibility: isCollapsed ? 'hidden' : 'visible',
              display: gameservers.data.length > 1 ? 'block' : 'none',
            }}
          >
            <GlobalGameServerSelect currentSelectedGameServerId={gameServerId} />
          </div>
          {gameServerLinks.map((link) => renderLink(link, isCollapsed))}
        </>
      ) : (
        <>
          <h3 style={{ visibility: isCollapsed ? 'hidden' : 'visible' }}>Game Server</h3>
          <div style={{ visibility: isCollapsed ? 'hidden' : 'visible' }}>
            <NoServersCallToAction
              initial={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p>Step into the world of Takaro by adding your first server!</p>
              <Button icon={<AddServerIcon />} fullWidth onClick={() => navigate({ to: '/gameservers/create' })}>
                Add a server
              </Button>
            </NoServersCallToAction>
          </div>
        </>
      )}
    </Nav>
  );
};
