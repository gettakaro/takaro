import { Outlet, useNavigate } from '@tanstack/react-router';
import { EmptyPage, Skeleton, Empty, Button } from '@takaro/lib-components';
import { rolesOptions } from 'queries/roles';
import { RoleCard, AddCard, CardList } from 'components/cards';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/roles')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(rolesOptions({ sortBy: 'system', sortDirection: 'desc' })),
  component: Component,
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
  const roles = Route.useLoaderData();
  const navigate = useNavigate();

  if (!roles) {
    return (
      <EmptyPage>
        <Empty
          header="No roles"
          description="Create a role and assign it to user or players."
          actions={[<Button text="Create a role" onClick={() => navigate({ to: '/roles/create' })} />]}
        />
        <Outlet />
      </EmptyPage>
    );
  }

  return (
    <>
      <CardList>
        {roles.data.map((role) => (
          <RoleCard key={role.id} {...role} />
        ))}
        <AddCard title="Role" onClick={() => navigate({ to: '/roles/create' })} />
      </CardList>
      {/* TODO: add back infinite scroll InfiniteScroll*/}
      {/* show rolesCreate and rolesUpdate drawers above this listView */}
      <Outlet />
    </>
  );
}
