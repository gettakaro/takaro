import { FC, PropsWithChildren, ReactElement, useMemo } from 'react';
import { PERMISSIONS, PermissionsGuard as Guard, RequiredPermissions } from '@takaro/lib-components';
import { useUser } from 'hooks/useUser';
import { hasPermissionHelper } from '@takaro/lib-components/src/components/other/PermissionsGuard';

interface PermissionsGuardProps {
  requiredPermissions: RequiredPermissions;
  fallback?: ReactElement;
}

export const PermissionsGuard: FC<PropsWithChildren<PermissionsGuardProps>> = ({
  requiredPermissions,
  children,
  fallback,
}) => {
  const { userData } = useUser();

  const userPermissions = useMemo(() => {
    if (!userData || !userData.roles) {
      return [];
    }

    const permissionsFromRoles = userData.roles
      .flatMap((assignments) =>
        assignments.role.permissions.map((permission) => permission.permission.permission as PERMISSIONS)
      )
      .filter((permission) => Object.values(PERMISSIONS).includes(permission));

    return Array.from(new Set(permissionsFromRoles as PERMISSIONS[]));
  }, [userData]); // only recalculated when userData changes

  return (
    <Guard requiredPermissions={requiredPermissions} userPermissions={userPermissions} fallback={fallback}>
      {children}
    </Guard>
  );
};

export const useHasPermission = (requiredPermissions: RequiredPermissions) => {
  const { userData } = useUser();

  const userPermissions = useMemo(() => {
    if (!userData || !userData.roles) {
      return new Set() as Set<PERMISSIONS>;
    }

    return userData.roles
      .flatMap((assign) => assign.role.permissions.map((permission) => permission.permission.permission as PERMISSIONS))
      .filter((permission) => Object.values(PERMISSIONS).includes(permission))
      .reduce((acc, permission) => acc.add(permission), new Set());
  }, [userData]) as Set<PERMISSIONS>;

  const hasPermission = useMemo(() => {
    return hasPermissionHelper(Array.from(userPermissions), requiredPermissions);
  }, [requiredPermissions, userPermissions]);

  return hasPermission;
};
