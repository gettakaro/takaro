import { FC, PropsWithChildren, ReactElement, useMemo } from 'react';
import { PERMISSIONS, PermissionsGuard as Guard, RequiredPermissions, useHasPermission } from '@takaro/lib-components';
import { useUser } from 'hooks/useUser';

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
      .map((role) => role.permissions.map((permission) => permission.permission.permission as PERMISSIONS))
      .reduce((acc, permissionList) => acc.concat(permissionList), [])
      .filter((permission) => Object.values(PERMISSIONS).includes(permission));

    return Array.from(new Set(permissionsFromRoles));
  }, [userData]); // only recalculated when userData changes

  return (
    <Guard requiredPermissions={requiredPermissions} userPermissions={userPermissions} fallback={fallback}>
      {children}
    </Guard>
  );
};

export const useUserHasPermissions = () => {
  const { userData } = useUser();

  const userPermissions = useMemo(() => {
    if (!userData || !userData.roles) {
      return [];
    }

    const permissionsFromRoles = userData.roles
      .map((role) => role.permissions.map((permission) => permission.permission.permission as PERMISSIONS))
      .reduce((acc, permissionList) => acc.concat(permissionList), [])
      .filter((permission) => Object.values(PERMISSIONS).includes(permission));

    return Array.from(new Set(permissionsFromRoles));
  }, [userData]);

  const hasPermission = (requiredPermissions: RequiredPermissions) => {
    return useHasPermission(userPermissions, requiredPermissions);
  };

  return hasPermission;
};
