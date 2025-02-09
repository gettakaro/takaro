import { createFileRoute, redirect } from '@tanstack/react-router';
import { SubmitHandler } from 'react-hook-form';

import { DrawerSkeleton } from '@takaro/lib-components';
import { permissionsQueryOptions, useRoleCreate } from '../../../queries/role';
import { RoleForm, IFormInputs } from './-roles/RoleCreateUpdateForm';
import { hasPermission } from '../../../hooks/useHasPermission';
import { userMeQueryOptions } from '../../../queries/user';

export const Route = createFileRoute('/_auth/_global/roles/create')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['MANAGE_ROLES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(permissionsQueryOptions()),
  component: Component,
  pendingComponent: DrawerSkeleton,
});

function Component() {
  const { mutate, isPending: isCreatingRole, error, isSuccess } = useRoleCreate();
  const permissions = Route.useLoaderData();
  const navigate = Route.useNavigate();

  if (isSuccess) {
    navigate({ to: '/roles' });
  }

  const onSubmit: SubmitHandler<IFormInputs> = ({ name, permissions: formPermissions }) => {
    const activePermissions = Object.entries(formPermissions)
      .filter(([_key, value]) => value.enabled === true)
      .map(([key, value]) => ({
        permissionId: key,
        count: value.count,
      }));
    mutate({
      name,
      permissions: activePermissions,
    });
  };

  return <RoleForm onSubmit={onSubmit} isLoading={isCreatingRole} permissions={permissions} error={error} />;
}
