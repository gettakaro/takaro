import { FC, useEffect } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { DrawerSkeleton } from '@takaro/lib-components';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import { usePermissions, useRoleCreate } from 'queries/roles';
import { RoleForm, IFormInputs } from './RoleForm';

export const CreateRole: FC = () => {
  const { data: permissions, isLoading: isLoadingPermissions } = usePermissions();
  const navigate = useNavigate();
  const { mutateAsync, isPending: isCreatingRole } = useRoleCreate();

  useEffect(() => {
    if (!open) {
      navigate(PATHS.roles.overview());
    }
  }, [open, navigate]);

  if (isLoadingPermissions || !permissions) return <DrawerSkeleton />;

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
    } catch (error) {}
  };

  return <RoleForm onSubmit={onSubmit} isLoading={isCreatingRole} permissions={permissions} />;
};
