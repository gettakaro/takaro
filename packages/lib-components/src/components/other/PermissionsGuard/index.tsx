import { FC, PropsWithChildren, ReactElement, useMemo } from 'react';
import { PERMISSIONS } from '@takaro/apiclient';

type PermissionsSet = PERMISSIONS | PERMISSIONS[];
export type RequiredPermissions = PermissionsSet[];

export interface PermissionsGuardProps {
  requiredPermissions: RequiredPermissions;
  userPermissions: PERMISSIONS[];
  fallback?: ReactElement;
}

export const hasPermissionHelper = (
  userPermissions: PERMISSIONS[],
  requiredPermissions: RequiredPermissions,
): boolean => {
  if (userPermissions.includes(PERMISSIONS.Root)) {
    return true;
  }
  return requiredPermissions.some((permissionSet) =>
    Array.isArray(permissionSet)
      ? permissionSet.every((permission) => userPermissions.includes(permission))
      : userPermissions.includes(permissionSet as PERMISSIONS),
  );
};

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
