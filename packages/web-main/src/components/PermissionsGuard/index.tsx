import { FC, PropsWithChildren } from 'react';

// This is a wrapper around the PermissionsGuard in LibComponents
// It still takes in the required permissions, but does some extra work to get the user permissions from the user context
import { PERMISSIONS, PermissionsGuard as Guard, RequiredPermissions } from '@takaro/lib-components';
import { useUser } from 'hooks/useUser';

interface PermissionsGuardProps {
  requiredPermissions: RequiredPermissions;
}

export const PermissionsGuard: FC<PropsWithChildren<PermissionsGuardProps>> = ({ requiredPermissions, children }) => {
  const { userData } = useUser();

  let userPermissions: PERMISSIONS[] = [];

  if (userData && userData.roles) {
    userPermissions = userData.roles
      .map((role) => role.permissions.map((permission) => permission.permission))
      .reduce((acc, permissionList) => acc.concat(permissionList), [])
      // IMPORTANT NOTE: a User can have permissions that are not in the PERMISSIONS enum (e.g. permissions from a module). These are filtered out here to make sure the PermissionsGuard works as expected.
      .filter((permission): permission is PERMISSIONS =>
        Object.values(PERMISSIONS).includes(permission as PERMISSIONS)
      );

    // Deduplicate the permissions
    userPermissions = [...new Set(userPermissions)];
  }

  return (
    <Guard requiredPermissions={requiredPermissions} userPermissions={userPermissions}>
      {children}
    </Guard>
  );
};
