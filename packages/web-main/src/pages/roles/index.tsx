import { FC } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { EmptyPage, Skeleton, Empty, Button } from '@takaro/lib-components';
import { useRoles } from 'queries/roles';
import { PATHS } from 'paths';
import { RoleCard, AddCard, CardList } from 'components/cards';
import { useDocumentTitle } from 'hooks/useDocumentTitle';

export const Roles: FC = () => {
  useDocumentTitle('Roles');
  const navigate = useNavigate();
  const { data: roles, isLoading, isError, InfiniteScroll } = useRoles();

  if (isLoading) {
    return (
      <CardList>
        <Skeleton variant="rectangular" height="100%" width="100%" />
        <Skeleton variant="rectangular" height="100%" width="100%" />
        <Skeleton variant="rectangular" height="100%" width="100%" />
        <Skeleton variant="rectangular" height="100%" width="100%" />
      </CardList>
    );
  }

  if (isError) {
    throw new Error('Failed while loading the roles');
  }

  if (!roles || roles.pages.length === 0 || roles.pages[0].data.length === 0) {
    return (
      <EmptyPage>
        <Empty
          header="No roles"
          description="Create a role and assign it to user or players."
          actions={[<Button text="Create a role" onClick={() => navigate(PATHS.roles.create())} />]}
        />
        <Outlet />
      </EmptyPage>
    );
  }

  return (
    <>
      <CardList>
        {roles.pages
          .flatMap((page) => page.data)
          .map((role) => (
            <RoleCard key={role.id} {...role} />
          ))}
        <AddCard title="Role" onClick={() => navigate(PATHS.roles.create())} />
      </CardList>
      {InfiniteScroll}
      {/* show rolesCreate and rolesUpdate drawers above this listView */}
      <Outlet />
    </>
  );
};
