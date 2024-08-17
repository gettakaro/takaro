import { Outlet, redirect, useNavigate, createFileRoute } from '@tanstack/react-router';
import { EmptyPage, Skeleton, Empty, Button, InfiniteScroll } from '@takaro/lib-components';
import { rolesInfiniteQueryOptions } from 'queries/role';
import { RoleCard, AddCard, CardList } from 'components/cards';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { hasPermission } from 'hooks/useHasPermission';
import { useInfiniteQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/_auth/_global/roles')({
  beforeLoad: async ({ context }) => {
    const session = await context.auth.getSession();
    if (!hasPermission(session, ['READ_ROLES'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ context }) => {
    const queryOpts = rolesInfiniteQueryOptions({ sortBy: 'system', sortDirection: 'desc' });
    const roles =
      context.queryClient.getQueryData(queryOpts.queryKey) ?? (await context.queryClient.fetchInfiniteQuery(queryOpts));
    return roles;
  },
  component: Component,

  notFoundComponent: () => {
    return (
      <EmptyPage>
        <Empty
          header="No roles"
          description="Create a role and assign it to user or players."
          actions={[
            <Button key="create-role-button" text="Create a role" onClick={() => redirect({ to: '/roles/create' })} />,
          ]}
        />
        <Outlet />
      </EmptyPage>
    );
  },
  pendingComponent: () => {
    return (
      <CardList>
        <Skeleton variant="rectangular" height="100%" width="100%" />
        <Skeleton variant="rectangular" height="100%" width="100%" />
        <Skeleton variant="rectangular" height="100%" width="100%" />
        <Skeleton variant="rectangular" height="100%" width="100%" />
      </CardList>
    );
  },
});

function Component() {
  useDocumentTitle('Roles');
  const loaderData = Route.useLoaderData();

  const {
    data: roles,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...rolesInfiniteQueryOptions({ sortBy: 'system', sortDirection: 'desc' }),
    initialData: loaderData,
  });
  const navigate = useNavigate();

  return (
    <>
      <CardList>
        {roles.pages
          .flatMap((page) => page.data)
          .map((role) => (
            <RoleCard key={role.id} {...role} />
          ))}
        <AddCard title="Role" onClick={() => navigate({ to: '/roles/create' })} />
      </CardList>
      <InfiniteScroll
        isFetching={isFetching}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
      <Outlet />
    </>
  );
}
