import { FC, useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { GlobalFrame } from '../frames/GlobalFrame';
import { StudioFrame } from '../frames/StudioFrame';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { Loading, styled } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { ServerFrame } from 'frames/GameServerFrame';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface AuthenticatedRouteProps {
  frame: 'global' | 'studio' | 'gameserver';
}

export const AuthenticatedRoute: FC<AuthenticatedRouteProps> = ({ frame }) => {
  const { getSession } = useAuth();
  const { setUserData } = useUser();
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [loading, isLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const handleAuth = useCallback(async () => {
    try {
      const user = await getSession();
      setIsAuth(true);
      setUserData(user); // because on refresh the context is cleared. we need to re-set the user data.
    } catch (error) {
      navigate(PATHS.login());
    } finally {
      isLoading(false);
    }
  }, [getSession, navigate, setUserData]);

  useEffect(() => {
    handleAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFrame() {
    switch (frame) {
      case 'global':
        return <GlobalFrame />;
      case 'gameserver':
        return <ServerFrame />;
      case 'studio':
        return <StudioFrame />;
      default:
        return <Outlet />;
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
