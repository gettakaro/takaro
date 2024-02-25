import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated === false) {
      throw redirect({ to: '/login', search: { redirect: location.pathname } });
    }
  },
  component: () => <Outlet />,
});
