import { Link } from '@tanstack/react-router';
import { DeveloperModeGuard } from '../DeveloperModeGuard';
import { PermissionsGuard } from '../PermissionsGuard';
import { cloneElement } from 'react';
import { NavbarLink } from '.';
import { Tooltip } from '@takaro/lib-components';

export const renderLink = (
  { linkProps, icon, label, requiredPermissions, requiresDevelopmentModeEnabled = false }: NavbarLink,
  isCollapsed?: boolean,
) => {
  // Parent items with children don't have linkProps
  if (!linkProps) {
    return null;
  }

  const linkContent = (
    <Link to={linkProps.to} key={`link-${linkProps.to}`}>
      <span key={`inner-${linkProps.to}`}>
        {cloneElement(icon, { size: 20, key: `icon-${linkProps.to}` })}
        {!isCollapsed && <p key={`label-${linkProps.to}`}>{label}</p>}
      </span>
    </Link>
  );

  const wrappedLink = isCollapsed ? (
    <Tooltip key={`tooltip-${linkProps.to}`} placement="right">
      <Tooltip.Trigger asChild>{linkContent}</Tooltip.Trigger>
      <Tooltip.Content>{label}</Tooltip.Content>
    </Tooltip>
  ) : (
    linkContent
  );

  return (
    <DeveloperModeGuard key={`developer-mode-guard-${linkProps.to}`} enabled={requiresDevelopmentModeEnabled}>
      <PermissionsGuard key={`permissions-guard-${linkProps.to}`} requiredPermissions={requiredPermissions || []}>
        <div key={`wrapper-${linkProps.to}`}>{wrappedLink}</div>
      </PermissionsGuard>
    </DeveloperModeGuard>
  );
};
