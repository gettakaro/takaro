import { useQuery } from '@tanstack/react-query';
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { SessionContext } from 'hooks/useSession';
import { userMeQueryOptions } from 'queries/user';

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    const session = await context.auth.getSession();
    if (!session) {
      const redirectPath = location.pathname === '/login' ? '/' : location.pathname;
      throw redirect({ to: '/login', search: { redirect: redirectPath }, replace: true });
    }
  },
  loader: async ({ context }) => {
    return await context.queryClient.ensureQueryData(userMeQueryOptions());
  },
  component: Component,
});

function Component() {
  const loaderData = Route.useLoaderData();
  const { data: session } = useQuery({ ...userMeQueryOptions(), initialData: loaderData });

  return (
    <SessionContext.Provider value={{ session }}>
      <Outlet />
    </SessionContext.Provider>
  );
}
