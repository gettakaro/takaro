import { useMemo } from 'react';
import { RequiredPermissions } from '@takaro/lib-components';
import { hasPermissionHelper } from '@takaro/lib-components/src/components/other/PermissionsGuard';
import { PERMISSIONS } from '@takaro/apiclient';
import { useAuth } from 'hooks/useAuth';

export const useHasPermission = (requiredPermissions: RequiredPermissions) => {
  const { session } = useAuth();

  const userPermissions = useMemo(() => {
    if (!session) {
      return [];
    }

    if (session.roles === undefined || session.roles.length === 0) {
      return new Set() as Set<PERMISSIONS>;
    }

    return session.roles
      .flatMap((assign) => assign.role.permissions.map((permission) => permission.permission.permission as PERMISSIONS))
      .filter((permission) => Object.values(PERMISSIONS).includes(permission))
      .reduce((acc, permission) => acc.add(permission), new Set());
  }, [session]) as Set<PERMISSIONS>;

  const hasPermission = useMemo(() => {
    return hasPermissionHelper(Array.from(userPermissions), requiredPermissions);
  }, [requiredPermissions, userPermissions]);

  return { hasPermission };
};
