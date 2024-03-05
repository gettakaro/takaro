import { DrawerSkeleton } from '@takaro/lib-components';
import { useRoleUpdate, roleQueryOptions, permissionsQueryOptions } from 'queries/roles/queries';
import { SubmitHandler } from 'react-hook-form';
import { RoleForm, IFormInputs } from './-roles/RoleCreateUpdateForm';
<<<<<<< HEAD
import { createFileRoute, redirect } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';
=======
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';
import { useEffect } from 'react';
>>>>>>> origin/main

export const Route = createFileRoute('/_auth/_global/roles/update/$roleId')({
  beforeLoad: ({ context }) => {
    if (!hasPermission(context.auth.session, ['READ_ROLES', 'MANAGE_ROLES'])) {
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
<<<<<<< HEAD
  const { mutate, isPending: isUpdatingRole, error } = useRoleUpdate();
  const { roleId } = Route.useParams();
=======
  const { mutate, isPending: isUpdatingRole, error, isSuccess } = useRoleUpdate();
  const { roleId } = Route.useParams();
  const navigate = useNavigate();
>>>>>>> origin/main

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

<<<<<<< HEAD
=======
  useEffect(() => {
    if (!open || isSuccess) {
      navigate({ to: '/roles' });
    }
  }, [open, navigate, isSuccess]);

>>>>>>> origin/main
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
