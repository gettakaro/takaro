import { useMutation, useQueryClient, queryOptions } from '@tanstack/react-query';
import { getApiClient } from 'util/getApiClient';
import {
  APIOutput,
  IdUuidDTO,
  UserOutputArrayDTOAPI,
  UserOutputWithRolesDTO,
  UserSearchInputDTO,
} from '@takaro/apiclient';
import { queryParamsToArray, mutationWrapper } from '../util';
import { AxiosError } from 'axios';
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

export const usersOptions = (queryParams: UserSearchInputDTO) =>
  queryOptions<UserOutputArrayDTOAPI, AxiosError<UserOutputArrayDTOAPI>>({
    queryKey: [...userKeys.list(), ...queryParamsToArray(queryParams)],
    queryFn: async () => (await getApiClient().user.userControllerSearch(queryParams)).data,
  });

export const userOptions = (userId: string) =>
  queryOptions<UserOutputWithRolesDTO, AxiosError<UserOutputWithRolesDTO>>({
    queryKey: [...userKeys.detail(userId)],
    queryFn: async () => (await getApiClient().user.userControllerGetOne(userId)).data.data,
  });

interface IUserRoleAssign {
  userId: string;
  roleId: string;
  expiresAt?: string;
}

export const useUserAssignRole = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<APIOutput, IUserRoleAssign>(
    useMutation<APIOutput, AxiosError<APIOutput>, IUserRoleAssign>({
      mutationFn: async ({ userId, roleId, expiresAt }) => {
        const res = (await apiClient.user.userControllerAssignRole(userId, roleId, { expiresAt })).data;
        queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
        return res;
      },
    }),
    {}
  );
};

export const useUserRemoveRole = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<APIOutput, RoleInput>(
    useMutation<APIOutput, AxiosError<APIOutput>, RoleInput>({
      mutationFn: async ({ userId, roleId }) => {
        const res = (await apiClient.user.userControllerRemoveRole(userId, roleId)).data;
        queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
        return res;
      },
    }),
    {}
  );
};

interface InviteUserInput {
  email: string;
}
export const useInviteUser = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<APIOutput, InviteUserInput>(
    useMutation<APIOutput, AxiosError<APIOutput>, InviteUserInput>({
      mutationFn: async ({ email }) => (await apiClient.user.userControllerInvite({ email })).data,
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: userKeys.list() });
      },
    }),
    {}
  );
};

interface UserRemoveInput {
  id: string;
}
export const useUserRemove = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<IdUuidDTO, UserRemoveInput>(
    useMutation<IdUuidDTO, AxiosError<IdUuidDTO>, UserRemoveInput>({
      mutationFn: async ({ id }) => (await apiClient.user.userControllerRemove(id)).data.data,
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: userKeys.list() });
        enqueueSnackbar('User has been deleted', { variant: 'default' });
      },
    }),
    {}
  );
};
