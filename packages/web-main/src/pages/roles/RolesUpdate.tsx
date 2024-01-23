import { Skeleton } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { useParams, useNavigate } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { usePermissions, useRole, useRoleUpdate } from 'queries/roles/queries';
import { SubmitHandler } from 'react-hook-form';
import { CreateUpdateRoleForm, IFormInputs } from './RolesCreateUpdateForm';

export const RolesUpdate = () => {
  const { roleId } = useParams();
  const { data: role, isLoading: isLoadingRole } = useRole(roleId!);
  const { data: permissions, isLoading: isLoadingPermissions } = usePermissions();
  const { mutateAsync, isPending: isUpdatingRole } = useRoleUpdate();
  const navigate = useNavigate();

  if (isLoadingPermissions || !permissions || isLoadingRole)
    return <Skeleton variant="rectangular" width="100%" height="100%" />;

  if (!role || !roleId) {
    return <>something went wrong</>;
  }

  const onSubmit: SubmitHandler<IFormInputs> = async ({ permissions: formPermissions, name }) => {
    const activePermissions = Object.entries(formPermissions)
      .filter(([_key, value]) => value.enabled === true)
      .map(([key, value]) => ({
        permissionId: key,
        count: value.count,
      }));
    try {
      await mutateAsync({
        roleId,
        roleDetails: {
          name,
          permissions: activePermissions,
        },
      });
      navigate(PATHS.roles.overview());
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  return (
    <CreateUpdateRoleForm onSubmit={onSubmit} initialData={role} permissions={permissions} isLoading={isUpdatingRole} />
  );
};
