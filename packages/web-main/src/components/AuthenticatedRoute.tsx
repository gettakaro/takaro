import { FC, useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { DashboardFrame } from '../frames/dashboardFrame';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { Loading,styled } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { ModuleWorkbenchFrame } from 'frames/moduleWorkbenchFrame';


const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface AuthenticatedRouteProps {
  frame: 'dashboard' | 'workbench' | 'none';
}

export const AuthenticatedRoute: FC<AuthenticatedRouteProps> = ({ frame }) => {
  const { getSession } = useAuth();
  const { setUserData } = useUser();
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [loading, isLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    handleAuth();
  }, []);

  function handleFrame() {
    switch (frame) {
      case 'dashboard':
        return (
          <DashboardFrame>
            <Outlet />
          </DashboardFrame>
        );
        case 'workbench':
          return (
            <ModuleWorkbenchFrame>
              <Outlet />
            </ModuleWorkbenchFrame>
          );        
      case 'none':
        return <Outlet />;
      default:
        return <Outlet />;
    }
  }

  async function handleAuth() {
    try {
      const user = await getSession();
      setIsAuth(true);
      setUserData(user); // because on refresh the context is cleared. we need to re-set the user data.
    } catch (error) {
      navigate(PATHS.login);
    } finally {
      isLoading(false);
    }
  }

  if (loading)
    return (
      <Container>
        <Loading fill="#fff" />
      </Container>
    );
  if (isAuth) {
    return handleFrame();
  }
  // This should not be reachable
  return <div></div>;
};
