import { FC, PropsWithChildren, ReactElement, useMemo } from 'react';
import { PERMISSIONS, PermissionsGuard as Guard, RequiredPermissions } from '@takaro/lib-components';
import { hasPermissionHelper } from '@takaro/lib-components/src/components/other/PermissionsGuard';
import { useAuth } from 'hooks/useAuth';

interface PermissionsGuardProps {
  requiredPermissions: RequiredPermissions;
  fallback?: ReactElement;
}

export const PermissionsGuard: FC<PropsWithChildren<PermissionsGuardProps>> = ({
  requiredPermissions,
  children,
  fallback,
}) => {
  const { session, isLoadingSession } = useAuth();

  const userPermissions = useMemo(() => {
    if (!session || isLoadingSession) {
      return []; // unreachable
    }

    if (session.roles === undefined || session.roles.length === 0) {
      return [];
    }

    const permissionsFromRoles = session.roles
      .flatMap((assignments) =>
        assignments.role.permissions.map((permission) => permission.permission.permission as PERMISSIONS)
      )
      .filter((permission) => Object.values(PERMISSIONS).includes(permission));

    return Array.from(new Set(permissionsFromRoles as PERMISSIONS[]));
  }, [session, isLoadingSession]); // only recalculated when userData changes

  if (isLoadingSession) {
    return <></>;
  }

  return (
    <Guard requiredPermissions={requiredPermissions} userPermissions={userPermissions} fallback={fallback}>
      {children}
    </Guard>
  );
};

export const useHasPermission = (requiredPermissions: RequiredPermissions) => {
  const { session, isLoadingSession } = useAuth();

  const userPermissions = useMemo(() => {
    if (!session || isLoadingSession) {
      return;
    }

    if (session.roles === undefined || session.roles.length === 0) {
      return new Set() as Set<PERMISSIONS>;
    }

    return session.roles
      .flatMap((assign) => assign.role.permissions.map((permission) => permission.permission.permission as PERMISSIONS))
      .filter((permission) => Object.values(PERMISSIONS).includes(permission))
      .reduce((acc, permission) => acc.add(permission), new Set());
  }, [session, isLoadingSession]) as Set<PERMISSIONS>;

  const hasPermission = useMemo(() => {
    return hasPermissionHelper(Array.from(userPermissions), requiredPermissions);
  }, [requiredPermissions, userPermissions]);

  return { hasPermission, isLoading: isLoadingSession };
};
