import { FC, useState, useEffect, useCallback } from 'react';
import { useAuth } from 'hooks/useAuth';
import { Loading, styled } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { setUser } from '@sentry/react';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const AuthenticationGuard: FC = () => {
  const { session, isLoadingSession, sessionError, isSessionError } = useAuth();
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [loading, isLoading] = useState<boolean>(true);

  const handleAuth = useCallback(() => {
    if (isLoadingSession) return;

    if (isSessionError) {
      console.error(sessionError);
    }

    try {
      if (!session) {
        return navigate(PATHS.login());
      }
      setUser({ id: session.id });
      setIsAuth(true);
    } catch (error) {
      navigate(PATHS.login());
    } finally {
      isLoading(false);
    }
  }, [session, isLoadingSession, navigate]);

  useEffect(() => {
    handleAuth();
  }, [isLoadingSession]);

  if (loading || isLoadingSession)
    return (
      <Container>
        <Loading fill="#fff" />
      </Container>
    );

  if (isAuth) {
    return <Outlet />;
  }

  // This should not be reachable
  return <></>;
};
