import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '../../hooks/useAuth';
import { useEffect } from 'react';

export const Route = createFileRoute('/_auth/logout')({
  component: LogOut,
});

function LogOut() {
  const { logOut } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logOut();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };
    performLogout();
  }, [logOut]);
  return <div>Logging out...</div>;
}
