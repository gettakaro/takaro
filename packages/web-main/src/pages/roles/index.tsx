import { FC } from 'react';
import { Helmet } from 'react-helmet';
import { Outlet, useNavigate } from 'react-router-dom';
import { EmptyPage, Skeleton, styled, Empty, Button } from '@takaro/lib-components';
import { useRoles } from 'queries/roles';
import { PATHS } from 'paths';
import { EmptyRolesCard, RoleCard } from 'components/roles/RoleCard';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  grid-auto-rows: 160px;
  gap: ${({ theme }) => theme.spacing['1_5']};
`;

export const Roles: FC = () => {
  const navigate = useNavigate();
  const { data: roles, isLoading, isError, InfiniteScroll } = useRoles();

  if (isLoading) {
    return (
      <Grid>
        <Skeleton variant="rectangular" height="100%" width="100%" />
        <Skeleton variant="rectangular" height="100%" width="100%" />
        <Skeleton variant="rectangular" height="100%" width="100%" />
        <Skeleton variant="rectangular" height="100%" width="100%" />
      </Grid>
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
      <Helmet>
        <title>Roles - Takaro</title>
      </Helmet>
      <Grid>
        <EmptyRolesCard onClick={() => navigate(PATHS.roles.create())} />
        {roles.pages
          .flatMap((page) => page.data)
          .map((role) => (
            <RoleCard key={role.id} {...role} />
          ))}
      </Grid>
      {InfiniteScroll}
      {/* show rolesCreate and rolesUpdate drawers above this listView */}
      <Outlet />
    </>
  );
};
