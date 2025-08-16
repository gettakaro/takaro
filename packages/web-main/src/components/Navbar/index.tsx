import { FC, ReactElement, useState, useEffect, cloneElement } from 'react';
import { LinkProps } from '@tanstack/react-router';
import { Chip, RequiredPermissions, Tooltip, useTheme, IconButton } from '@takaro/lib-components';
import { UserDropdown } from './UserDropdown';
import { Nav, IconNav, Container, IconNavContainer, NavItem, NestedNav, ExpandIndicator } from './style';
import { PERMISSIONS } from '@takaro/apiclient';
import { useSession } from '../../hooks/useSession';
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
  AiOutlineBarChart as AnalyticsIcon,
  AiOutlineShoppingCart as ShopIcon,
  AiOutlineRight as ChevronRightIcon,

  // icon nav
  AiOutlineBook as DocumentationIcon,
  AiOutlineGithub as GithubIcon,
} from 'react-icons/ai';

import { FaDiscord as DiscordIcon } from 'react-icons/fa';
import { GameServerNav } from './GameServerNav';
import { getConfigVar, getTakaroVersionComponents } from '../../util/getConfigVar';
import { renderLink } from './renderLink';
import { DeveloperModeGuard } from '../DeveloperModeGuard';
import { PermissionsGuard } from '../PermissionsGuard';

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
    label: 'Analytics',
    icon: <AnalyticsIcon />,
    requiresDevelopmentModeEnabled: false,
    children: [
      {
        label: 'Shop',
        linkProps: {
          to: '/analytics/shop',
        },
        icon: <ShopIcon />,
        requiresDevelopmentModeEnabled: false,
        requiredPermissions: [PERMISSIONS.ManageShopListings],
      },
    ],
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
  linkProps?: Partial<LinkProps>;
  label: string;
  icon: ReactElement;
  requiredPermissions?: RequiredPermissions;
  requiresDevelopmentModeEnabled?: boolean;
  end?: boolean;
  children?: NavbarLink[];
}

interface NavbarProps {
  showGameServerNav?: boolean;
}

export const Navbar: FC<NavbarProps> = ({ showGameServerNav }) => {
  const theme = useTheme();
  const { version } = getTakaroVersionComponents(getConfigVar('takaroVersion'));
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const { session } = useSession();

  // Find the current domain from the session
  const currentDomain = session.domains.find((domain) => domain.id === session.domain);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('navbar-collapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }

    // Load expanded items state
    const savedExpanded = localStorage.getItem('navbar-expanded-items');
    if (savedExpanded !== null) {
      setExpandedItems(JSON.parse(savedExpanded));
    }
  }, []);

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('navbar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Save expanded items state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('navbar-expanded-items', JSON.stringify(expandedItems));
  }, [expandedItems]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const renderNavLink = (link: NavbarLink, depth = 0) => {
    const key = link.label;
    const isExpanded = expandedItems[link.label] || false;
    const hasChildren = link.children && link.children.length > 0;

    // If it's a parent item with children
    if (hasChildren) {
      const parentContent = (
        <NavItem
          $isParent={true}
          $isCollapsed={isCollapsed}
          className="parent-item"
          onClick={() => toggleExpanded(link.label)}
        >
          <span>
            {link.icon && cloneElement(link.icon, { size: 20 })}
            {!isCollapsed && <p>{link.label}</p>}
          </span>
          {!isCollapsed && (
            <ExpandIndicator animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRightIcon />
            </ExpandIndicator>
          )}
        </NavItem>
      );

      const wrappedParent = isCollapsed ? (
        <Tooltip>
          <Tooltip.Trigger asChild>{parentContent}</Tooltip.Trigger>
          <Tooltip.Content>{link.label}</Tooltip.Content>
        </Tooltip>
      ) : (
        parentContent
      );

      return (
        <DeveloperModeGuard key={key} enabled={link.requiresDevelopmentModeEnabled || false}>
          <PermissionsGuard requiredPermissions={link.requiredPermissions || []}>
            <div>
              {wrappedParent}
              {!isCollapsed && (
                <NestedNav
                  initial={false}
                  animate={{
                    height: isExpanded ? 'auto' : 0,
                    opacity: isExpanded ? 1 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  $isCollapsed={isCollapsed}
                >
                  {link.children?.map((child) => renderNavLink(child, depth + 1))}
                </NestedNav>
              )}
            </div>
          </PermissionsGuard>
        </DeveloperModeGuard>
      );
    }

    // Regular link item
    return renderLink(link, isCollapsed);
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
          {domainLinks.length > 0 && <h3 style={{ visibility: isCollapsed ? 'hidden' : 'visible' }}>Global</h3>}
          {domainLinks.map((link) => renderNavLink(link))}
        </Nav>
      </IconNavContainer>
      {!isCollapsed && (
        <div style={{ width: '100%' }}>
          <UserDropdown />
          <div
            style={{ display: 'flex', justifyContent: 'center', marginTop: theme.spacing['1'], alignItems: 'center' }}
          >
            <span style={{ marginRight: theme.spacing['0_5'] }}>Domain: </span>
            <Chip showIcon="hover" color="secondary" variant="outline" label={currentDomain?.name || 'Unknown'} />
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
