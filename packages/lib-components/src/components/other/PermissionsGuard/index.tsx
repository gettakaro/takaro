import { FC, PropsWithChildren, ReactElement, useMemo } from 'react';
import { PERMISSIONS } from '@takaro/apiclient';
import { RequiredPermissions, hasPermissionHelper } from './hasPermissionsHelper';

export interface PermissionsGuardProps {
  requiredPermissions: RequiredPermissions;
  userPermissions: PERMISSIONS[];
  fallback?: ReactElement;
}

export const PermissionsGuard: FC<PropsWithChildren<PermissionsGuardProps>> = ({
  userPermissions,
  requiredPermissions,
  children,
  fallback,
}) => {
  // only update permissions when userPermissions or requiredPermissions change
  const hasPermission = useMemo(() => {
    return hasPermissionHelper(userPermissions, requiredPermissions);
  }, [userPermissions, requiredPermissions]);

  if (!hasPermission) {
    return fallback ?? null;
  }

  return <>{children}</>;
};
