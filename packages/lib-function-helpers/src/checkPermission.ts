import { PermissionOutputDTO } from '@takaro/apiclient';

export function checkPermission(player: any, permission: string) {
  const roles = player.roles.map((r: any) => r.role);
  const permissions = roles.map((r: any) => r.permissions).flat();

  return permissions.some((p: PermissionOutputDTO) => p.permission === permission);
}
