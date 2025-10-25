import { AddCard, CardList, RoleCard } from '../../components/cards';
import { useNavigate } from '@tanstack/react-router';
import { InfiniteScroll, Skeleton } from '@takaro/lib-components';
import { rolesInfiniteQueryOptions } from '../../queries/role';
import { useInfiniteQuery } from '@tanstack/react-query';

export const RolesCardView = () => {
  const {
    data: roles,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...rolesInfiniteQueryOptions({ sortBy: 'system', sortDirection: 'desc' }),
  });
  const navigate = useNavigate();

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

  if (!roles) {
    return 'Failed to load roles?';
  }

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
    </>
  );
};
