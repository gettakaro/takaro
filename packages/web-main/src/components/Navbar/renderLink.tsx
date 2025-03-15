import { Link } from '@tanstack/react-router';
import { DeveloperModeGuard } from '../DeveloperModeGuard';
import { PermissionsGuard } from '../PermissionsGuard';
import { cloneElement } from 'react';
import { NavbarLink } from '.';

export const renderLink = ({
  linkProps,
  icon,
  label,
  requiredPermissions,
  requiresDevelopmentModeEnabled = false,
}: NavbarLink) => (
  <DeveloperModeGuard key={`developer-mode-guard-${linkProps.to}`} enabled={requiresDevelopmentModeEnabled}>
    <PermissionsGuard key={`permissions-guard-${linkProps.to}`} requiredPermissions={requiredPermissions || []}>
      <div key={`wrapper-${linkProps.to}`}>
        <Link to={linkProps.to} key={`link-${linkProps.to}`}>
          <span key={`inner-${linkProps.to}`}>
            {cloneElement(icon, { size: 20, key: `icon-${linkProps.to}` })}
            <p key={`label-${linkProps.to}`}>{label}</p>
          </span>
        </Link>
      </div>
    </PermissionsGuard>
  </DeveloperModeGuard>
);
