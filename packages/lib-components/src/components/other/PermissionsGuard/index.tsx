import { FC, PropsWithChildren, ReactElement, useMemo } from 'react';

// Would be better that this comes from apiclient so it is automatically synced with the backend
export enum PERMISSIONS {
  'ROOT' = 'ROOT',
  'MANAGE_USERS' = 'MANAGE_USERS',
  'READ_USERS' = 'READ_USERS',
  'MANAGE_ROLES' = 'MANAGE_ROLES',
  'READ_ROLES' = 'READ_ROLES',
  'MANAGE_GAMESERVERS' = 'MANAGE_GAMESERVERS',
  'READ_GAMESERVERS' = 'READ_GAMESERVERS',
  'READ_FUNCTIONS' = 'READ_FUNCTIONS',
  'MANAGE_FUNCTIONS' = 'MANAGE_FUNCTIONS',
  'READ_CRONJOBS' = 'READ_CRONJOBS',
  'MANAGE_CRONJOBS' = 'MANAGE_CRONJOBS',
  'READ_HOOKS' = 'READ_HOOKS',
  'MANAGE_HOOKS' = 'MANAGE_HOOKS',
  'READ_COMMANDS' = 'READ_COMMANDS',
  'MANAGE_COMMANDS' = 'MANAGE_COMMANDS',
  'READ_MODULES' = 'READ_MODULES',
  'MANAGE_MODULES' = 'MANAGE_MODULES',
  'READ_PLAYERS' = 'READ_PLAYERS',
  'MANAGE_PLAYERS' = 'MANAGE_PLAYERS',
  'MANAGE_SETTINGS' = 'MANAGE_SETTINGS',
  'READ_SETTINGS' = 'READ_SETTINGS',
  'READ_VARIABLES' = 'READ_VARIABLES',
  'MANAGE_VARIABLES' = 'MANAGE_VARIABLES',
  'READ_EVENTS' = 'READ_EVENTS',
  'MANAGE_EVENTS' = 'MANAGE_EVENTS',
}

type PermissionsSet = PERMISSIONS | PERMISSIONS[];
export type RequiredPermissions = PermissionsSet[];

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
    // If the user has the ROOT permission, they have access to everything
    if (userPermissions.includes(PERMISSIONS.ROOT)) {
      return true;
    }

    // AND/OR logic for permissions
    return requiredPermissions.some((permissionSet) =>
      Array.isArray(permissionSet)
        ? permissionSet.every((permission) => userPermissions.includes(permission))
        : userPermissions.includes(permissionSet as PERMISSIONS)
    );
  }, [userPermissions, requiredPermissions]);

  if (!hasPermission) {
    return fallback ?? null;
  }

  return <>{children}</>;
};
