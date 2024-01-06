import { FC, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import { useHasPermission } from 'components/PermissionsGuard';
import { useAuth } from 'hooks/useAuth';
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

  const { isLoading, hasPermission, userPermissions } = useHasPermission(permissions);
  const { logOut } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    // Logout the user because he can't do anything wihout premissions & redirect to the forbidden page.
    if (userPermissions.size === 0) {
      logOut(PATHS.forbidden());
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
