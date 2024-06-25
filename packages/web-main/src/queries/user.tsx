import { useMutation, useQueryClient, queryOptions } from '@tanstack/react-query';
import { getApiClient } from 'util/getApiClient';
import {
  APIOutput,
  IdUuidDTO,
  MeOutoutDTO,
  UserOutputArrayDTOAPI,
  UserOutputWithRolesDTO,
  UserSearchInputDTO,
} from '@takaro/apiclient';
import { queryParamsToArray, mutationWrapper } from './util';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';

export const userKeys = {
  all: ['users'] as const,
  list: () => [...userKeys.all, 'list'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
  me: () => [...userKeys.all, 'me'] as const,
};

interface RoleInput {
  userId: string;
  roleId: string;
}

export const usersQueryOptions = (queryParams: UserSearchInputDTO) =>
  queryOptions<UserOutputArrayDTOAPI, AxiosError<UserOutputArrayDTOAPI>>({
    queryKey: [...userKeys.list(), ...queryParamsToArray(queryParams)],
    queryFn: async () => (await getApiClient().user.userControllerSearch(queryParams)).data,
  });

export const userQueryOptions = (userId: string) =>
  queryOptions<UserOutputWithRolesDTO, AxiosError<UserOutputWithRolesDTO>>({
    queryKey: userKeys.detail(userId),
    queryFn: async () => (await getApiClient().user.userControllerGetOne(userId)).data.data,
  });

export const userMeQueryOptions = () =>
  queryOptions<MeOutoutDTO, AxiosError<MeOutoutDTO>>({
    queryKey: userKeys.me(),
    queryFn: async () => (await getApiClient().user.userControllerMe()).data.data,
  });

interface IUserRoleAssign {
  userId: string;
  roleId: string;
  expiresAt?: string;
}

export const useUserAssignRole = ({ userId }: { userId: string }) => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<APIOutput, IUserRoleAssign>(
    useMutation<APIOutput, AxiosError<APIOutput>, IUserRoleAssign>({
      mutationFn: async ({ userId, roleId, expiresAt }) =>
        (await apiClient.user.userControllerAssignRole(userId, roleId, { expiresAt })).data,
      onSuccess: async () => {
        // invalidate user because new role assignment
        queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      },
    }),
    {}
  );
};

interface IUserSetSelectedDomain {
  domainId: string;
}
export const useUserSetSelectedDomain = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<void, IUserSetSelectedDomain>(
    useMutation<void, AxiosError<APIOutput>, IUserSetSelectedDomain>({
      mutationFn: async ({ domainId }) => (await apiClient.user.userControllerSetSelectedDomain(domainId)).data,
      onSuccess: async () => {
        queryClient.clear();
      },
    }),
    {}
  );
};

export const useUserRemoveRole = ({ userId }: { userId: string }) => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<APIOutput, RoleInput>(
    useMutation<APIOutput, AxiosError<APIOutput>, RoleInput>({
      mutationFn: async ({ userId, roleId }) => (await apiClient.user.userControllerRemoveRole(userId, roleId)).data,
      onSuccess: async () => {
        // invalidate user because new role assignment
        queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
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
