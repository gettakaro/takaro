import { FC, cloneElement, ReactElement } from 'react';
import { Link, LinkProps } from '@tanstack/react-router';
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
import { PermissionsGuard } from 'components/PermissionsGuard';
import { useHasPermission } from 'hooks/useHasPermission';
import { GameServerNav } from './GameServerNav';
import { TAKARO_DOMAIN_COOKIE_REGEX } from 'routes/_auth/domain.select';

const domainLinks: NavbarLink[] = [
  {
    label: 'Dashboard',
    linkProps: {
      to: '/dashboard',
    },
    icon: <DashboardIcon />,
  },
  {
    label: 'Game servers',
    linkProps: {
      to: '/gameservers',
    },
    icon: <GameServersIcon />,
    requiredPermissions: [PERMISSIONS.ManageGameservers],
  },
  {
    label: 'Events',
    linkProps: {
      to: '/events',
    },
    icon: <EventsIcon />,
    requiredPermissions: [PERMISSIONS.ReadEvents],
  },
  {
    label: 'Players',
    linkProps: {
      to: '/players',
    },
    icon: <PlayersIcon />,
    requiredPermissions: [PERMISSIONS.ReadPlayers],
  },
  {
    label: 'Users',
    linkProps: {
      to: '/users',
    },
    icon: <UsersIcon />,
    requiredPermissions: [PERMISSIONS.ReadUsers],
  },
  {
    label: 'Roles',
    linkProps: {
      to: '/roles',
    },
    icon: <RolesIcon />,
    requiredPermissions: [PERMISSIONS.ReadRoles],
  },
  {
    label: 'Modules',
    linkProps: {
      to: '/modules',
    },
    icon: <ModulesIcon />,
    requiredPermissions: [PERMISSIONS.ReadModules],
  },
  {
    label: 'Variables',
    linkProps: {
      to: '/variables',
    },
    icon: <VariablesIcon />,
    requiredPermissions: [PERMISSIONS.ReadVariables],
  },
  {
    label: 'Settings',
    linkProps: {
      to: '/settings/gameservers',
    },
    icon: <SettingsIcon />,
    end: false,
    requiredPermissions: [PERMISSIONS.ReadSettings],
  },
];

export interface NavbarLink {
  linkProps: Partial<LinkProps>;
  label: string;
  icon: ReactElement;
  requiredPermissions?: RequiredPermissions;
  end?: boolean;
}

export const renderLink = ({ linkProps, icon, label, requiredPermissions }: NavbarLink) => (
  <PermissionsGuard key={`guard-${linkProps.to}`} requiredPermissions={requiredPermissions || []}>
    <div key={`wrapper-${linkProps.to}`}>
      <Link to={linkProps.to} key={`link-${linkProps.to}`}>
        <span key={`inner-${linkProps.to}`}>
          {cloneElement(icon, { size: 20, key: `icon-${linkProps.to}` })}
          <p key={`label-${linkProps.to}`}>{label}</p>
        </span>
      </Link>
    </div>
  </PermissionsGuard>
);

interface NavbarProps {
  showGameServerNav?: boolean;
}

export const Navbar: FC<NavbarProps> = ({ showGameServerNav }) => {
  const { hasPermission } = useHasPermission([PERMISSIONS.ManageGameservers]);
  const theme = useTheme();

  return (
    <Container animate={{ width: 325 }} transition={{ duration: 1, type: 'spring', bounce: 0.5 }}>
      <IconNavContainer data-testid="takaro-icon-nav">
        {hasPermission && showGameServerNav && <GameServerNav />}
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
