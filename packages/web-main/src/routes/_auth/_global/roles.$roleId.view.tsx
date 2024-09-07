import { DrawerSkeleton } from '@takaro/lib-components';
import { permissionsQueryOptions, roleQueryOptions } from 'queries/role';
import { RoleForm } from './-roles/RoleCreateUpdateForm';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';
import { userMeQueryOptions } from 'queries/user';

export const Route = createFileRoute('/_auth/_global/roles/$roleId/view')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['READ_ROLES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ params, context }) => {
    const p1 = context.queryClient.ensureQueryData(roleQueryOptions(params.roleId));
    const p2 = context.queryClient.ensureQueryData(permissionsQueryOptions());
    const [role, permissions] = await Promise.all([p1, p2]);
    return { role, permissions };
  },
  component: Component,
  pendingComponent: DrawerSkeleton,
});

function Component() {
  const { role, permissions } = Route.useLoaderData();
  return <RoleForm initialData={role} permissions={permissions} error={null} />;
}
