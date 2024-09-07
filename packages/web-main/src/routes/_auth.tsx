import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { SessionContext } from 'hooks/useSession';
import { userMeQueryOptions } from 'queries/user';

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    const session = await context.auth.getSession();
    if (!session) {
      const redirectPath = location.pathname === '/login' ? '/' : location.pathname;
      throw redirect({ to: '/login', search: { redirect: redirectPath } });
    }
  },

  loader: async ({ context }) => {
    return await context.queryClient.ensureQueryData(userMeQueryOptions());
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
