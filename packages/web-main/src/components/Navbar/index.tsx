import { FC, ReactElement } from 'react';
import { LinkProps } from '@tanstack/react-router';
import { Chip, RequiredPermissions, Tooltip, useTheme } from '@takaro/lib-components';
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

  // icon nav
  AiOutlineBook as DocumentationIcon,
  AiOutlineGithub as GithubIcon,
} from 'react-icons/ai';

import { FaDiscord as DiscordIcon } from 'react-icons/fa';
import { GameServerNav } from './GameServerNav';
import { TAKARO_DOMAIN_COOKIE_REGEX } from '../../util/domainCookieRegex';
import { getConfigVar, getTakaroVersionComponents } from '../../util/getConfigVar';
import { renderLink } from './renderLink';
import { IconBaseProps } from 'react-icons';

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
  icon: ReactElement<IconBaseProps>;
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

  return (
    <Container animate={{ width: 325 }} transition={{ duration: 1, type: 'spring', bounce: 0.5 }}>
      <IconNavContainer data-testid="takaro-icon-nav">
        {showGameServerNav && <GameServerNav />}
        <Nav data-testid="global-nav">
          {domainLinks.length > 0 && <h3>Global</h3>}
          {domainLinks.map((link) => renderLink(link))}
        </Nav>
      </IconNavContainer>
      <div style={{ width: '100%' }}>
        <UserDropdown />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: theme.spacing['1'], alignItems: 'center' }}>
          <span style={{ marginRight: theme.spacing['0_5'] }}>Domain: </span>
          <Chip
            showIcon="hover"
            color="secondary"
            variant="outline"
            label={`${document.cookie.replace(TAKARO_DOMAIN_COOKIE_REGEX, '$1')}`}
          />
        </div>
        <div
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: theme.spacing['0_75'] }}
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
    </Container>
  );
};
