import { PermissionOutputDTO } from '@takaro/apiclient';

export function checkPermission(player: any, permission: string) {
  const roles = player.roles.map((r: any) => r.role);
  const permissions = roles
    .map((r: any) => r.permissions)
    .flat()
    .map((p: any) => p.permission);

  const specificPerm = permissions.filter((p: PermissionOutputDTO) => p.permission === permission)[0];

  if (specificPerm) {
    // Find the assignment record so we can return count too
    const role = roles.filter((r: any) => r.permissions.some((p: any) => p.permission.permission === permission))[0];
    const assignment = role.permissions.find((p: any) => {
      return p.permission.permission === permission;
    });
    return { ...specificPerm, count: assignment.count };
  }
  if (permissions.some((p: PermissionOutputDTO) => p.permission === 'ROOT')) return true;
  return false;
}
