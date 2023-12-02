import { useAuth } from 'hooks/useAuth';
import { PATHS } from 'paths';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const LogOut = () => {
  const { logOut, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // We do not want to add session as a dependency here
    if (session) {
      logOut().then(() => {});
    } else {
      navigate(PATHS.login());
    }
  }, [logOut]);

  return <div>Logging out...</div>;
};
