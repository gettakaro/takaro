import { PermissionOutputDTO } from '@takaro/apiclient';

export function checkPermission(player: any, permission: string) {
  const roles = player.roles.map((r: any) => r.role);
  const permissions = roles
    .map((r: any) => r.permissions)
    .flat()
    .map((p: any) => p.permission);

  return permissions.some((p: PermissionOutputDTO) => p.permission === permission || p.permission === 'ROOT');
}
