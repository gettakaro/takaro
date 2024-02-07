import { FC, useEffect } from 'react';
import { useAuth } from 'hooks/useAuth';
import { Loading, styled } from '@takaro/lib-components';
import { PATHS } from 'paths';
import * as Sentry from '@sentry/react';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const AuthenticationGuard: FC = () => {
  const { session, isLoadingSession, isSessionError } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (isLoadingSession) return;

    if (!session) {
      return navigate(PATHS.login());
    } else {
      Sentry.setUser({ id: session.id, email: session.email, username: session.name });
    }
  }, [session, isLoadingSession, navigate, isSessionError]);

  if (isLoadingSession) {
    return (
      <Container>
        <Loading fill="#fff" />
      </Container>
    );
  }

  if (isSessionError) {
    enqueueSnackbar('A failure happened during authentication.', { type: 'error' });
    navigate(PATHS.login());
    return <></>;
  }

  return session ? <Outlet /> : <></>;
};
