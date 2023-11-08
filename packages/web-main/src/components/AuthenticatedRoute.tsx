import { FC, useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { GlobalFrame } from '../frames/GlobalFrame';
import { StudioFrame } from '../frames/StudioFrame';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { Loading, styled } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { setUser } from '@sentry/react';
import { useNavigate } from 'react-router-dom';

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
  const { session, isLoading: isLoadingSession } = useAuth();
  const { setUserData } = useUser();
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [loading, isLoading] = useState<boolean>(true);

  const handleAuth = useCallback(() => {
    if (isLoadingSession) return;
    try {
      if (!session) return navigate(PATHS.login());

      setUser({ id: session.id! });
      setIsAuth(true);
      setUserData(session); // because on refresh the context is cleared. we need to re-set the user data.
    } catch (error) {
      navigate(PATHS.login());
    } finally {
      isLoading(false);
    }
  }, [session, setUserData, isLoadingSession, navigate]);

  useEffect(() => {
    handleAuth();
  }, [isLoadingSession]);

  function handleFrame() {
    switch (frame) {
      case 'global':
        return <GlobalFrame />;
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
