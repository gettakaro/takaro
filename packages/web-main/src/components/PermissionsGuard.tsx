import { PERMISSIONS } from '@takaro/apiclient';
import { PermissionsGuard as Guard, RequiredPermissions } from '@takaro/lib-components';
import { useSession } from 'hooks/useSession';
import { FC, PropsWithChildren, ReactElement, useMemo } from 'react';

interface PermissionsGuardProps {
  requiredPermissions: RequiredPermissions;
  fallback?: ReactElement;
}

export const PermissionsGuard: FC<PropsWithChildren<PermissionsGuardProps>> = ({
  requiredPermissions,
  children,
  fallback,
}) => {
  const { session } = useSession();

  const userPermissions = useMemo(() => {
    if (!session) {
      return []; // unreachable
    }

    if (session.roles === undefined || session.roles.length === 0) {
      return [];
    }

    const permissionsFromRoles = session.roles
      .flatMap((assignments) =>
        assignments.role.permissions.map((permission) => permission.permission.permission as PERMISSIONS),
      )
      .filter((permission) => Object.values(PERMISSIONS).includes(permission));

    return Array.from(new Set(permissionsFromRoles as PERMISSIONS[]));
  }, [session]); // only recalculated when userData changes

  return (
    <Guard requiredPermissions={requiredPermissions} userPermissions={userPermissions} fallback={fallback}>
      {children}
    </Guard>
  );
};
