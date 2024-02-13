import { useEffect } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { DrawerSkeleton } from '@takaro/lib-components';
import { permissionsOptions, useRoleCreate } from 'queries/roles';
import { RoleForm, IFormInputs } from './-roles/RoleCreateUpdateForm';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { hasPermission } from 'hooks/useHasPermission';

export const Route = createFileRoute('/_auth/roles/create')({
  beforeLoad: ({ context }) => {
    if (!hasPermission(context.auth.session, ['MANAGE_ROLES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(permissionsOptions()),
  component: Component,
  pendingComponent: DrawerSkeleton,
});

function Component() {
  const navigate = useNavigate();
  const { mutate, isPending: isCreatingRole, error } = useRoleCreate();
  const permissions = Route.useLoaderData();

  useEffect(() => {
    if (!open) {
      navigate({ to: '/roles' });
    }
  }, [open, navigate]);

  const onSubmit: SubmitHandler<IFormInputs> = ({ name, permissions: formPermissions }) => {
    try {
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
      navigate({ to: '/roles' });
    } catch (error) {}
  };

  return <RoleForm onSubmit={onSubmit} isLoading={isCreatingRole} permissions={permissions} error={error} />;
}
