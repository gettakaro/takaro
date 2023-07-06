import { useInfiniteQuery, useMutation } from 'react-query';
import { useApiClient } from 'hooks/useApiClient';
import { UserSearchInputDTO } from '@takaro/apiclient';
import { hasNextPage } from '../util';
import { useMemo } from 'react';
import { InfiniteScroll as InfiniteScrollComponent } from '@takaro/lib-components';

export const userKeys = {
  all: ['users'] as const,
  list: () => [...userKeys.all, 'list'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};

interface RoleInput {
  userId: string;
  roleId: string;
}

export const useUsers = ({ page = 0, ...userSearchInputArgs }: UserSearchInputDTO = {}) => {
  const apiClient = useApiClient();

  const queryOpts = useInfiniteQuery({
    queryKey: userKeys.list(),
    queryFn: async ({ pageParam = page }) =>
      (
        await apiClient.user.userControllerSearch({
          ...userSearchInputArgs,
          page: pageParam,
        })
      ).data,
    getNextPageParam: (lastPage, pages) => hasNextPage(lastPage.meta, pages.length),
  });

  const InfiniteScroll = useMemo(() => {
    return <InfiniteScrollComponent {...queryOpts} />;
  }, [queryOpts]);

  return { ...queryOpts, InfiniteScroll };
};

export const useUserAssignRole = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async ({ userId, roleId }: RoleInput) =>
      (await apiClient.user.userControllerAssignRole(userId, roleId)).data,
  });
};

export const useUserRemoveRole = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async ({ userId, roleId }: RoleInput) =>
      (await apiClient.user.userControllerRemoveRole(userId, roleId)).data,
  });
};
