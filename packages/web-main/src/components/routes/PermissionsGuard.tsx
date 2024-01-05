import { FC, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import { useHasPermission } from 'components/PermissionsGuard';
import { Loading } from '@takaro/lib-components';
import { PERMISSIONS } from '@takaro/apiclient';

interface PermissionsRouteProps {
  permissions: PERMISSIONS[];
}

/// Route that checks if the user has the required permissions to access the route.
export const PermissionsGuard: FC<PermissionsRouteProps> = ({ permissions }) => {
  // This extra state is required to prevent the user from seeing the page for a split second before being redirected.
  // Because the useEffect runs after the render, resulting in 401/403 responses.
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const { isLoading, hasPermission } = useHasPermission(permissions);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    hasPermission ? setIsAuthorized(true) : navigate(PATHS.forbidden());
  }, [permissions, hasPermission, navigate]);

  // here we load until we are certain the user is authorized.
  if (!isAuthorized || isLoading) {
    return <Loading />;
  }

  return <Outlet />;
};
