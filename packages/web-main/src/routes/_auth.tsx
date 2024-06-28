import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { SessionContext } from 'hooks/useSession';

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    const session = await context.auth.getSession();
    if (!session) {
      const redirectPath = location.pathname === '/login' ? '/' : location.pathname;
      throw redirect({ to: '/login', search: { redirect: redirectPath } });
    }
  },

  loader: async ({ context }) => {
    return await context.auth.getSession();
  },
  component: Component,
});

function Component() {
  const session = Route.useLoaderData();

  return (
    <SessionContext.Provider value={{ session }}>
      <Outlet />
    </SessionContext.Provider>
  );
}
