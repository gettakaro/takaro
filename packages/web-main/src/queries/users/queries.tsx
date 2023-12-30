import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from 'hooks/useApiClient';
import {
  APIOutput,
  IdUuidDTO,
  UserOutputArrayDTOAPI,
  UserOutputWithRolesDTO,
  UserSearchInputDTO,
} from '@takaro/apiclient';
import { hasNextPage } from '../util';
import { AxiosError } from 'axios';
import { useMemo } from 'react';
import { InfiniteScroll as InfiniteScrollComponent } from '@takaro/lib-components';
import { useSnackbar } from 'notistack';

export const userKeys = {
  all: ['users'] as const,
  list: () => [...userKeys.all, 'list'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};

interface RoleInput {
  userId: string;
  roleId: string;
}

export const useInfiniteUsers = (queryParams: UserSearchInputDTO = { page: 0 }) => {
  const apiClient = useApiClient();

  const queryOpts = useInfiniteQuery<UserOutputArrayDTOAPI, AxiosError<UserOutputArrayDTOAPI>>({
    queryKey: [...userKeys.list(), { ...queryParams }],
    queryFn: async ({ pageParam = queryParams.page }) =>
      (
        await apiClient.user.userControllerSearch({
          ...queryParams,
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

export const useUsers = (queryParams: UserSearchInputDTO = { page: 0 }) => {
  const apiClient = useApiClient();

  const queryOpts = useQuery<UserOutputArrayDTOAPI, AxiosError<UserOutputArrayDTOAPI>>({
    queryKey: [...userKeys.list(), { queryParams }],
    queryFn: async () => (await apiClient.user.userControllerSearch(queryParams)).data,
    keepPreviousData: true,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
  return queryOpts;
};

export const useUser = (userId: string) => {
  const apiClient = useApiClient();

  const queryOpts = useQuery<UserOutputWithRolesDTO, AxiosError<UserOutputWithRolesDTO>>({
    queryKey: [...userKeys.detail(userId)],
    queryFn: async () => (await apiClient.user.userControllerGetOne(userId)).data.data,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
  return queryOpts;
};

interface IUserRoleAssign {
  userId: string;
  roleId: string;
  expiresAt?: string;
}

export const useUserAssignRole = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<APIOutput, AxiosError<APIOutput>, IUserRoleAssign>({
    mutationFn: async ({ userId, roleId, expiresAt }) => {
      const res = (await apiClient.user.userControllerAssignRole(userId, roleId, { expiresAt })).data;
      queryClient.invalidateQueries(userKeys.detail(userId));
      return res;
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

export const useUserRemoveRole = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<APIOutput, AxiosError<APIOutput>, RoleInput>({
    mutationFn: async ({ userId, roleId }: RoleInput) => {
      const res = (await apiClient.user.userControllerRemoveRole(userId, roleId)).data;
      queryClient.invalidateQueries(userKeys.detail(userId));
      return res;
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

export const useInviteUser = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<APIOutput, AxiosError<APIOutput>, { email: string }>({
    mutationFn: async ({ email }) => (await apiClient.user.userControllerInvite({ email })).data,
    useErrorBoundary: (error) => error.response!.status >= 500,
    onSuccess: async () => {
      await queryClient.invalidateQueries(userKeys.list());
    },
  });
};

export const useUserRemove = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation<IdUuidDTO, AxiosError<IdUuidDTO>, { id: string }>({
    mutationFn: async ({ id }) => (await apiClient.user.userControllerRemove(id)).data.data,
    useErrorBoundary: (error) => error.response!.status >= 500,
    onSuccess: async () => {
      await queryClient.invalidateQueries(userKeys.list());
      enqueueSnackbar('User has been deleted', { variant: 'default' });
    },
  });
};
