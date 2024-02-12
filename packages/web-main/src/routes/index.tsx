import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (
      context.auth === undefined ||
      context.auth === null ||
      (context.auth && context.auth.isAuthenticated === false)
    ) {
      throw redirect({ to: '/login' });
    }
    throw redirect({ to: '/dashboard' });
  },
});
