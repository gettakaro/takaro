import { FC } from 'react';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { useHasPermission } from 'hooks/useHasPermission';
import { PERMISSIONS } from '@takaro/apiclient';

interface PermissionsRouteProps {
  permissions: PERMISSIONS[];
}

/// Route that checks if the user has the required permissions to access the route.
export const PermissionsGuard: FC<PermissionsRouteProps> = ({ permissions }) => {
  // This extra state is required to prevent the user from seeing the page for a split second before being redirected.
  // Because the useEffect runs after the render, resulting in 401/403 responses.
  const { hasPermission } = useHasPermission(permissions);
  const navigate = useNavigate();

  if (hasPermission === false) {
    navigate({ to: '/forbidden' });
  }

  return <Outlet />;
};
