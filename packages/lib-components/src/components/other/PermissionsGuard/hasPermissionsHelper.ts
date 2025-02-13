import { PERMISSIONS } from '@takaro/apiclient';

type PermissionsSet = PERMISSIONS | PERMISSIONS[];
export type RequiredPermissions = PermissionsSet[];

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
