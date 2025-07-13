import { FC, ReactElement, useState, useEffect } from 'react';
import { LinkProps } from '@tanstack/react-router';
import { Chip, RequiredPermissions, Tooltip, useTheme, IconButton } from '@takaro/lib-components';
import { UserDropdown } from './UserDropdown';
import { Nav, IconNav, Container, IconNavContainer } from './style';
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
  AiOutlineLeft as CollapseIcon,
  AiOutlineRight as ExpandIcon,

  // icon nav
  AiOutlineBook as DocumentationIcon,
  AiOutlineGithub as GithubIcon,
} from 'react-icons/ai';

import { FaDiscord as DiscordIcon } from 'react-icons/fa';
import { GameServerNav } from './GameServerNav';
import { TAKARO_DOMAIN_COOKIE_REGEX } from '../../util/domainCookieRegex';
import { getConfigVar, getTakaroVersionComponents } from '../../util/getConfigVar';
import { renderLink } from './renderLink';

const domainLinks: NavbarLink[] = [
  {
    label: 'Dashboard',
    linkProps: {
      to: '/dashboard',
    },
    icon: <DashboardIcon />,
    requiresDevelopmentModeEnabled: false,
  },
  {
    label: 'Game servers',
    linkProps: {
      to: '/gameservers',
    },
    icon: <GameServersIcon />,
    requiredPermissions: [PERMISSIONS.ManageGameservers],
    requiresDevelopmentModeEnabled: false,
  },
  {
    label: 'Events',
    linkProps: {
      to: '/events',
    },
    icon: <EventsIcon />,
    requiredPermissions: [PERMISSIONS.ReadEvents],
    requiresDevelopmentModeEnabled: false,
  },
  {
    label: 'Players',
    linkProps: {
      to: '/players',
    },
    icon: <PlayersIcon />,
    requiredPermissions: [PERMISSIONS.ReadPlayers],
    requiresDevelopmentModeEnabled: false,
  },
  {
    label: 'Users',
    linkProps: {
      to: '/users',
    },
    icon: <UsersIcon />,
    requiredPermissions: [PERMISSIONS.ReadUsers],
    requiresDevelopmentModeEnabled: false,
  },
  {
    label: 'Roles',
    linkProps: {
      to: '/roles',
    },
    icon: <RolesIcon />,
    requiredPermissions: [PERMISSIONS.ReadRoles],
    requiresDevelopmentModeEnabled: false,
  },
  {
    label: 'Module Builder',
    linkProps: {
      to: '/modules',
    },
    icon: <ModulesIcon />,
    requiresDevelopmentModeEnabled: true,
    requiredPermissions: [PERMISSIONS.ReadModules],
  },
  {
    label: 'Variables',
    linkProps: {
      to: '/variables',
    },
    icon: <VariablesIcon />,
    requiresDevelopmentModeEnabled: false,
    requiredPermissions: [PERMISSIONS.ReadVariables],
  },
  {
    label: 'Settings',
    linkProps: {
      to: '/settings/gameservers',
    },
    icon: <SettingsIcon />,
    end: false,
    requiresDevelopmentModeEnabled: false,
    requiredPermissions: [PERMISSIONS.ReadSettings],
  },
];

export interface NavbarLink {
  linkProps: Partial<LinkProps>;
  label: string;
  icon: ReactElement;
  requiredPermissions?: RequiredPermissions;
  requiresDevelopmentModeEnabled?: boolean;
  end?: boolean;
}

interface NavbarProps {
  showGameServerNav?: boolean;
}

export const Navbar: FC<NavbarProps> = ({ showGameServerNav }) => {
  const theme = useTheme();
  const { version } = getTakaroVersionComponents(getConfigVar('takaroVersion'));
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('navbar-collapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('navbar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Container
      animate={{ width: isCollapsed ? 60 : 325 }}
      transition={{ duration: 0.3, type: 'spring', bounce: 0.3 }}
      $isCollapsed={isCollapsed}
    >
      <div style={{ position: 'absolute', top: theme.spacing['1'], right: theme.spacing['0_5'], zIndex: 10 }}>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <IconButton
              icon={isCollapsed ? <ExpandIcon /> : <CollapseIcon />}
              onClick={toggleCollapse}
              size="small"
              ariaLabel={isCollapsed ? 'Expand navbar' : 'Collapse navbar'}
            />
          </Tooltip.Trigger>
          <Tooltip.Content>{isCollapsed ? 'Expand' : 'Collapse'}</Tooltip.Content>
        </Tooltip>
      </div>
      <IconNavContainer data-testid="takaro-icon-nav">
        {showGameServerNav && <GameServerNav isCollapsed={isCollapsed} />}
        <Nav data-testid="global-nav" $isCollapsed={isCollapsed}>
          {domainLinks.length > 0 && !isCollapsed && <h3>Global</h3>}
          {domainLinks.map((link) => renderLink(link, isCollapsed))}
        </Nav>
      </IconNavContainer>
      {!isCollapsed && (
        <div style={{ width: '100%' }}>
          <UserDropdown />
          <div
            style={{ display: 'flex', justifyContent: 'center', marginTop: theme.spacing['1'], alignItems: 'center' }}
          >
            <span style={{ marginRight: theme.spacing['0_5'] }}>Domain: </span>
            <Chip
              showIcon="hover"
              color="secondary"
              variant="outline"
              label={`${document.cookie.replace(TAKARO_DOMAIN_COOKIE_REGEX, '$1')}`}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: theme.spacing['0_75'],
            }}
          >
            Version: <Chip showIcon="hover" color="secondary" variant="outline" label={version} />
          </div>
          <IconNav>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <a href="https://aka.takaro.io/github" target="_blank" rel="noreferrer">
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
                <a href="https://aka.takaro.io/discord" target="_blank" rel="noreferrer">
                  <DiscordIcon size={18} />
                </a>
              </Tooltip.Trigger>
              <Tooltip.Content>Discord</Tooltip.Content>
            </Tooltip>
          </IconNav>
        </div>
      )}
    </Container>
  );
};
