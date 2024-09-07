import { useMemo } from 'react';
import { RequiredPermissions } from '@takaro/lib-components';
import { hasPermissionHelper } from '@takaro/lib-components/src/components/other/PermissionsGuard';
import { MeOutoutDTO, PERMISSIONS } from '@takaro/apiclient';
import { useSession } from './useSession';

export const useHasPermission = (requiredPermissions: RequiredPermissions) => {
  const { session } = useSession();

  const userPermissions = useMemo(() => {
    if (!session) {
      return [];
    }

    if (session.user.roles === undefined || session.user.roles.length === 0) {
      return new Set() as Set<PERMISSIONS>;
    }

    return session.user.roles
      .flatMap((assign) => assign.role.permissions.map((permission) => permission.permission.permission as PERMISSIONS))
      .filter((permission) => Object.values(PERMISSIONS).includes(permission))
      .reduce((acc, permission) => acc.add(permission), new Set());
  }, [session]) as Set<PERMISSIONS>;

  const hasPermission = useMemo(() => {
    return hasPermissionHelper(Array.from(userPermissions), requiredPermissions);
  }, [requiredPermissions, userPermissions]);

  return { hasPermission };
};

// Non hook version
export const hasPermission = (session: MeOutoutDTO, requiredPermissions: RequiredPermissions): boolean => {
  if (!session) {
    return false;
  }

  const userPermissions = () => {
    if (session.user.roles === undefined || session.user.roles.length === 0) {
      return new Set() as Set<PERMISSIONS>;
    }

    return session.user.roles
      .flatMap((assign) => assign.role.permissions.map((permission) => permission.permission.permission as PERMISSIONS))
      .filter((permission) => Object.values(PERMISSIONS).includes(permission))
      .reduce((acc, permission) => acc.add(permission), new Set()) as Set<PERMISSIONS>;
  };

  return hasPermissionHelper(Array.from(userPermissions()), requiredPermissions);
};

export const getUserPermissions = (session: MeOutoutDTO): PERMISSIONS[] => {
  if (session.user.roles === undefined || session.user.roles.length === 0) {
    return [];
  }

  return Array.from(
    session.user.roles
      .flatMap((assign) => assign.role.permissions.map((permission) => permission.permission.permission as PERMISSIONS))
      .filter((permission) => Object.values(PERMISSIONS).includes(permission))
      .reduce((acc, permission) => acc.add(permission), new Set()) as Set<PERMISSIONS>,
  );
};
