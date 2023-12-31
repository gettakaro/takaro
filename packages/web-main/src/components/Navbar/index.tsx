import { FC, cloneElement, ReactElement } from 'react';
import { NavLink } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Company, RequiredPermissions, Tooltip } from '@takaro/lib-components';
import { UserDropdown } from './UserDropdown';
import { PATHS } from 'paths';
import { Nav, IconNav, Container } from './style';
import { PERMISSIONS } from '@takaro/apiclient';
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
} from 'react-icons/ai';

import { FaDiscord as DiscordIcon } from 'react-icons/fa';
import { PermissionsGuard, useHasPermission } from 'components/PermissionsGuard';
import { GameServerNav } from './GameServerNav';

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
    requiredPermissions: [PERMISSIONS.ReadGameservers],
  },
  {
    label: 'Events',
    path: PATHS.events(),
    icon: <EventsIcon />,
    requiredPermissions: [PERMISSIONS.ReadEvents],
  },
  {
    label: 'Players',
    path: PATHS.players(),
    icon: <PlayersIcon />,
    requiredPermissions: [PERMISSIONS.ReadPlayers],
  },
  {
    label: 'Users',
    path: PATHS.users(),
    icon: <UsersIcon />,
    requiredPermissions: [PERMISSIONS.ReadUsers],
  },
  {
    label: 'Roles',
    path: PATHS.roles.overview(),
    icon: <RolesIcon />,
    requiredPermissions: [PERMISSIONS.ReadRoles],
  },
  {
    label: 'Modules',
    path: PATHS.moduleDefinitions(),
    icon: <ModulesIcon />,
    requiredPermissions: [PERMISSIONS.ReadModules],
  },
  {
    label: 'Variables',
    path: PATHS.variables.overview(),
    icon: <VariablesIcon />,
    requiredPermissions: [PERMISSIONS.ReadVariables],
  },
  {
    label: 'Settings',
    path: PATHS.settings.overview(),
    icon: <SettingsIcon />,
    end: false,
    requiredPermissions: [PERMISSIONS.ReadSettings],
  },
];

export interface NavbarLink {
  path: string;
  label: string;
  icon: ReactElement;
  requiredPermissions?: RequiredPermissions;
  end?: boolean;
}

export const renderLink = ({ path, icon, label, end, requiredPermissions }: NavbarLink) => (
  <PermissionsGuard key={`guard-${path}`} requiredPermissions={requiredPermissions || []}>
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

export const Navbar: FC = () => {
  const { hasPermission: hasReadGameServerPermission, isLoading } = useHasPermission([PERMISSIONS.ReadGameservers]);

  return (
    <Container animate={{ width: 325 }} transition={{ duration: 1, type: 'spring', bounce: 0.5 }}>
      <div data-testid="takaro-icon-nav" style={{ width: '100%' }}>
        <Link className="company-icon" to={PATHS.home()} style={{ display: 'block', marginLeft: '15px' }}>
          <Company textVisible={false} />
        </Link>

        {!isLoading && hasReadGameServerPermission && <GameServerNav />}

        <Nav data-testid="global-nav">
          {domainLinks.length > 0 && <h3>Global</h3>}
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
