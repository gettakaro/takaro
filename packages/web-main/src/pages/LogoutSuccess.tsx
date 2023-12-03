import { useQueryClient } from '@tanstack/react-query';
import { PATHS } from 'paths';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const LogoutSuccess = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    queryClient.removeQueries({ queryKey: ['session'] });
    localStorage.removeItem('selectedGameServerId');
    navigate(PATHS.login());
  });

  return <div>Logout success, you are being redirected.</div>;
};
