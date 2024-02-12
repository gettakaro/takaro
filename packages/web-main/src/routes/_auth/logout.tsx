import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from 'hooks/useAuth';
import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/logout')({
  component: LogOut,
});

function LogOut() {
  const { logOut, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // We do not want to add session as a dependency here
    if (session) {
      logOut().then(() => {});
    } else {
      navigate({ to: '/login' });
    }
  }, [logOut]);

  return <div>Logging out...</div>;
}
