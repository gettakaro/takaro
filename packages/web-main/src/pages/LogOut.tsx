import { useAuth } from 'hooks/useAuth';
import { PATHS } from 'paths';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const LogOut = () => {
  const { logOut, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      logOut().then(() => {});
    } else {
      // already logged out
      navigate(PATHS.login());
    }
  }, [logOut, session]);
  return <div>Logging out...</div>;
};
