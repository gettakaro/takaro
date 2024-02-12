import { DrawerSkeleton } from '@takaro/lib-components';
import { useRoleUpdate, roleOptions, permissionsOptions } from 'queries/roles/queries';
import { SubmitHandler } from 'react-hook-form';
import { RoleForm, IFormInputs } from './-roles/RoleCreateUpdateForm';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/roles/update/$roleId')({
  loader: async ({ params, context }) => {
    const p1 = context.queryClient.ensureQueryData(roleOptions(params.roleId));
    const p2 = context.queryClient.ensureQueryData(permissionsOptions());
    const [role, permissions] = await Promise.all([p1, p2]);
    return { role, permissions };
  },
  component: Component,
  pendingComponent: DrawerSkeleton,
});

function Component() {
  const { role, permissions } = Route.useLoaderData();
  const { mutate, isPending: isUpdatingRole, error } = useRoleUpdate();
  const { roleId } = Route.useParams();

  const onSubmit: SubmitHandler<IFormInputs> = ({ permissions: formPermissions, name }) => {
    const activePermissions = Object.entries(formPermissions)
      .filter(([_key, value]) => value.enabled === true)
      .map(([key, value]) => ({
        permissionId: key,
        count: value.count,
      }));
    mutate({
      roleId,
      roleDetails: {
        name,
        permissions: activePermissions,
      },
    });
  };

  return (
    <RoleForm
      onSubmit={onSubmit}
      initialData={role}
      permissions={permissions}
      isLoading={isUpdatingRole}
      error={error}
    />
  );
}
