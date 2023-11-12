import { FC, cloneElement, ReactElement, useMemo, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Button, Company, PERMISSIONS, RequiredPermissions, Tooltip } from '@takaro/lib-components';
import { GameServerSelectNav } from './GameServerSelectNav';
import { UserDropdown } from './UserDropdown';
import { PATHS } from 'paths';
import { Nav, IconNav, Container, NoServersCallToAction } from './style';

import {
  AiOutlineAppstore as DashboardIcon,
  AiOutlineSetting as SettingsIcon,
  AiOutlineFunction as ModulesIcon,
  AiOutlineDatabase as GameServersIcon,
  AiOutlineIdcard as PlayersIcon,
  AiOutlineUser as UsersIcon,
  AiOutlineUser as RolesIcon,
  AiOutlineEdit as VariablesIcon,
  AiOutlineClockCircle as EventsIcon,

  // icon nav
  AiOutlineBook as DocumentationIcon,
  AiOutlineGithub as GithubIcon,

  // add server button
  AiOutlinePlus as AddServerIcon,
} from 'react-icons/ai';

import { FaDiscord as DiscordIcon } from 'react-icons/fa';
import { useGameServers } from 'queries/gameservers';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { PermissionsGuard } from 'components/PermissionsGuard';

const domainLinks: NavbarLink[] = [
  {
    label: 'Dashboard',
    path: PATHS.home(),
    icon: <DashboardIcon />,
  },
  {
    label: 'Servers',
    path: PATHS.gameServers.overview(),
    icon: <GameServersIcon />,
    requiredPermissions: [PERMISSIONS.READ_GAMESERVERS],
  },
  {
    label: 'Events',
    path: PATHS.events(),
    icon: <EventsIcon />,
    requiredPermissions: [PERMISSIONS.READ_EVENTS],
  },
  {
    label: 'Players',
    path: PATHS.players(),
    icon: <PlayersIcon />,
    requiredPermissions: [PERMISSIONS.READ_PLAYERS],
  },
  {
    label: 'Users',
    path: PATHS.users(),
    icon: <UsersIcon />,
    requiredPermissions: [PERMISSIONS.READ_USERS],
  },
  {
    label: 'Roles',
    path: PATHS.roles.overview(),
    icon: <RolesIcon />,
  },
  {
    label: 'Modules',
    path: PATHS.moduleDefinitions(),
    icon: <ModulesIcon />,
    requiredPermissions: [PERMISSIONS.READ_MODULES],
  },
  {
    label: 'Variables',
    path: PATHS.variables(),
    icon: <VariablesIcon />,
    requiredPermissions: [PERMISSIONS.READ_VARIABLES],
  },
  {
    label: 'Settings',
    path: PATHS.settings.overview(),
    icon: <SettingsIcon />,
    end: false,
    requiredPermissions: [PERMISSIONS.READ_SETTINGS],
  },
];

export interface NavbarLink {
  path: string;
  label: string;
  icon: ReactElement;
  requiredPermissions?: RequiredPermissions;
  end?: boolean;
}

export const Navbar: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = useGameServers();
  const { selectedGameServerId, setSelectedGameServerId } = useSelectedGameServer();

  const gameServerLinks: NavbarLink[] = useMemo(() => {
    return [
      {
        label: 'Dashboard',
        // If serverId is not valid it will be directed by the failed requests.
        path: PATHS.gameServer.dashboard(selectedGameServerId),
        icon: <DashboardIcon />,
      },
      {
        label: 'Modules',
        path: PATHS.gameServer.modules(selectedGameServerId),
        icon: <ModulesIcon />,
      },
      {
        label: 'Settings',
        path: PATHS.gameServer.settings(selectedGameServerId),
        icon: <SettingsIcon />,
      },
    ];
  }, [selectedGameServerId]);

  const renderLink = ({ path, icon, label, end, requiredPermissions }: NavbarLink) => (
    <PermissionsGuard requiredPermissions={requiredPermissions || []}>
      <div key={`wrapper-${path}`}>
        <NavLink to={path} key={`link-${path}`} end={end}>
          <span key={`inner-${path}`}>
            {cloneElement(icon, { size: 20, key: `icon-${path}` })}
            <p key={`label-${path}`}>{label}</p>
          </span>
        </NavLink>
      </div>
    </PermissionsGuard>
  );

  useEffect(() => {
    // If there is no selectedGameServerId, select the first one.
    if (selectedGameServerId === '' && data && data.pages[0].data.length > 0) {
      setSelectedGameServerId(data.pages[0].data[0].id);
    }
  }, [selectedGameServerId]);

  const isInGameServerNav = gameServerLinks.some((link) => location.pathname.includes(link.path));

  return (
    <Container animate={{ width: 325 }} transition={{ duration: 1, type: 'spring', bounce: 0.5 }}>
      <div style={{ width: '100%' }}>
        <Link className="company-icon" to={PATHS.home()}>
          <Company />
        </Link>

        {data && data.pages[0].data.length > 0 ? (
          <Nav>
            <h3>Server</h3>
            <GameServerSelectNav
              isInGameServerNav={isInGameServerNav}
              serverId={selectedGameServerId}
              setServerId={setSelectedGameServerId}
            />
            {gameServerLinks.map((link) => renderLink(link))}
          </Nav>
        ) : (
          <Nav>
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
          </Nav>
        )}

        <Nav>
          <h3>Global</h3>
          {domainLinks.map((link) => renderLink(link))}
        </Nav>
      </div>
      <div style={{ width: '100%' }}>
        <UserDropdown />
        <IconNav>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <a href="https://github.com/gettakaro/takaro" target="_blank" rel="noreferrer">
                <GithubIcon size={18} />
              </a>
            </Tooltip.Trigger>
            <Tooltip.Content>Github</Tooltip.Content>
          </Tooltip>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <a href="https://docs.takaro.io" target="_blank" rel="noreferrer">
                <DocumentationIcon size={18} />
              </a>
            </Tooltip.Trigger>
            <Tooltip.Content>Documentation</Tooltip.Content>
          </Tooltip>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <a href="https://catalysm.net/discord/" target="_blank" rel="noreferrer">
                <DiscordIcon size={18} />
              </a>
            </Tooltip.Trigger>
            <Tooltip.Content>Discord</Tooltip.Content>
          </Tooltip>
        </IconNav>
      </div>
    </Container>
  );
};
