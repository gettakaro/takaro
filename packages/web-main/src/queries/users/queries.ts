import { useMutation } from 'react-query';
import { useApiClient } from 'hooks/useApiClient';
import { APIOutput } from '@takaro/apiclient';
import { TakaroError } from 'queries/errorType';

export const userKeys = {
  all: ['users'] as const,
  list: () => [...userKeys.all, 'list'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};

interface RoleInput {
  userId: string;
  roleId: string;
}
export const useUserAssignRole = () => {
  const apiClient = useApiClient();

  return useMutation<APIOutput, TakaroError, RoleInput>({
    mutationFn: async ({ userId, roleId }) =>
      (await apiClient.user.userControllerAssignRole(userId, roleId)).data,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

export const useUserRemoveRole = () => {
  const apiClient = useApiClient();

  return useMutation<APIOutput, TakaroError, RoleInput>({
    mutationFn: async ({ userId, roleId }: RoleInput) =>
      (await apiClient.user.userControllerRemoveRole(userId, roleId)).data,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};
