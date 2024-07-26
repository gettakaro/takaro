import { DrawerSkeleton } from '@takaro/lib-components';
import { useRoleUpdate, roleQueryOptions, permissionsQueryOptions } from 'queries/role';
import { SubmitHandler } from 'react-hook-form';
import { RoleForm, IFormInputs } from './-roles/RoleCreateUpdateForm';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';
import { useSnackbar } from 'notistack';

export const Route = createFileRoute('/_auth/_global/roles/update/$roleId')({
  beforeLoad: async ({ context }) => {
    const session = await context.auth.getSession();
    if (!hasPermission(session, ['READ_ROLES', 'MANAGE_ROLES'])) {
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
  const { mutate, isPending: isUpdatingRole, error, isSuccess } = useRoleUpdate();
  const { roleId } = Route.useParams();
  const navigate = Route.useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  if (isSuccess) {
    enqueueSnackbar('Role updated!', { variant: 'default', type: 'success' });
    navigate({ to: '/roles' });
  }

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
