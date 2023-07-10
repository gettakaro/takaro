import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { useApiClient } from 'hooks/useApiClient';
import { APIOutput, UserOutputArrayDTOAPI, UserSearchInputDTO } from '@takaro/apiclient';
import { hasNextPage } from '../util';
import { AxiosError } from 'axios';
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

  const queryOpts = useInfiniteQuery<UserOutputArrayDTOAPI, AxiosError<UserOutputArrayDTOAPI>>({
    queryKey: userKeys.list(),
    queryFn: async ({ pageParam = page }) =>
      (
        await apiClient.user.userControllerSearch({
          ...userSearchInputArgs,
          page: pageParam,
        })
      ).data,
    getNextPageParam: (lastPage, pages) => hasNextPage(lastPage.meta, pages.length),
    useErrorBoundary: (error) => error.response!.status >= 500,
  });

  const InfiniteScroll = useMemo(() => {
    return <InfiniteScrollComponent {...queryOpts} />;
  }, [queryOpts]);

  return { ...queryOpts, InfiniteScroll };
};

export const useUserAssignRole = () => {
  const apiClient = useApiClient();

  return useMutation<APIOutput, AxiosError<APIOutput>, RoleInput>({
    mutationFn: async ({ userId, roleId }) => (await apiClient.user.userControllerAssignRole(userId, roleId)).data,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

export const useUserRemoveRole = () => {
  const apiClient = useApiClient();

  return useMutation<APIOutput, AxiosError<APIOutput>, RoleInput>({
    mutationFn: async ({ userId, roleId }: RoleInput) =>
      (await apiClient.user.userControllerRemoveRole(userId, roleId)).data,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};
