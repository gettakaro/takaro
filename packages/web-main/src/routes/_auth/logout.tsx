import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../hooks/useAuth';
import { useEffect } from 'react';

export const Route = createFileRoute('/_auth/logout')({
  component: LogOut,
});

function LogOut() {
  const { logOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logOut();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };
    performLogout();
  }, [navigate]);
  return <div>Logging out...</div>;
}
