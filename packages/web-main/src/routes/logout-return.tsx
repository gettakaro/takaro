import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/logout-return')({
  component: Component,
});

function Component() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const router = useRouter();

  useEffect(() => {
    queryClient.removeQueries({ queryKey: ['session'] });
    router.invalidate().finally(() => {
      navigate({ to: '/login', replace: true });
    });
  });

  return <div>Logout success, you are being redirected.</div>;
}
