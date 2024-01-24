import { FC, useEffect } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { Skeleton } from '@takaro/lib-components';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import * as Sentry from '@sentry/react';
import { usePermissions, useRoleCreate } from 'queries/roles';
import { CreateUpdateRoleForm, IFormInputs } from './RolesCreateUpdateForm';

export const RolesCreate: FC = () => {
  const { data: permissions, isLoading: isLoadingPermissions } = usePermissions();

  if (isLoadingPermissions || !permissions) return <Skeleton variant="rectangular" width="100%" height="100%" />;

  const navigate = useNavigate();
  const { mutateAsync, isLoading: isCreatingRole } = useRoleCreate();

  useEffect(() => {
    if (!open) {
      navigate(PATHS.roles.overview());
    }
  }, [open, navigate]);

  const onSubmit: SubmitHandler<IFormInputs> = async ({ name, permissions: formPermissions }) => {
    try {
      const activePermissions = Object.entries(formPermissions)
        .filter(([_key, value]) => value.enabled === true)
        .map(([key, value]) => ({
          permissionId: key,
          count: value.count,
        }));
      await mutateAsync({
        name,
        permissions: activePermissions,
      });
      navigate(PATHS.roles.overview());
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  return <CreateUpdateRoleForm onSubmit={onSubmit} isLoading={isCreatingRole} permissions={permissions} />;
};
