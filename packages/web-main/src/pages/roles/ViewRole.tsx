import { DrawerSkeleton } from '@takaro/lib-components';
import { useParams } from 'react-router-dom';
import { usePermissions, useRole } from 'queries/roles/queries';
import { RoleForm } from './RoleForm';

export const ViewRole = () => {
  const { roleId } = useParams() as { roleId: string };
  const { data: role, isLoading: isLoadingRole } = useRole(roleId);
  const { data: permissions, isLoading: isLoadingPermissions } = usePermissions();

  if (isLoadingPermissions || !permissions || isLoadingRole) return <DrawerSkeleton />;

  if (!role || !roleId) {
    return <>something went wrong</>;
  }

  return <RoleForm initialData={role} permissions={permissions} />;
};
