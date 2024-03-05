import {
  RoleSearchInputDTO,
  RoleOutputArrayDTOAPI,
  RoleOutputDTO,
  RoleCreateInputDTO,
  RoleUpdateInputDTO,
  IdUuidDTO,
  IdUuidDTOAPI,
  RoleOutputDTOAPI,
  PermissionOutputDTOAPI,
  PermissionOutputDTO,
  APIOutput,
} from '@takaro/apiclient';
import { InfiniteData, infiniteQueryOptions, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { getApiClient } from 'util/getApiClient';
import { hasNextPage, mutationWrapper, queryParamsToArray } from 'queries/util';
import { playerKeys } from 'queries/players/queries';
import { userKeys } from 'queries/users';
import { ErrorMessageMapping } from '@takaro/lib-components/src/errors';

export const roleKeys = {
  all: ['roles'] as const,
  list: () => [...roleKeys.all, 'list'] as const,
  detail: (id: string) => [...roleKeys.all, 'detail', id] as const,
  permissions: () => [...roleKeys.all, 'permissions'] as const,
};

const defaultRoleErrorMessages: Partial<ErrorMessageMapping> = {
  UniqueConstraintError: 'Role with this name already exists',
};

export const roleQueryOptions = (roleId: string) =>
  queryOptions<RoleOutputDTO, AxiosError<RoleOutputDTOAPI>>({
    queryKey: roleKeys.detail(roleId),
    queryFn: async () => (await getApiClient().role.roleControllerGetOne(roleId)).data.data,
  });

export const rolesOptions = (opts: RoleSearchInputDTO = {}) => {
  return queryOptions<RoleOutputArrayDTOAPI, AxiosError<RoleOutputArrayDTOAPI>>({
    queryKey: [...roleKeys.list(), ...queryParamsToArray(opts)],
    queryFn: async () => (await getApiClient().role.roleControllerSearch(opts)).data,
  });
};

export const rolesInfiniteQueryOptions = (opts: RoleSearchInputDTO = {}) => {
  return infiniteQueryOptions<RoleOutputArrayDTOAPI, AxiosError<RoleOutputArrayDTOAPI>>({
    queryKey: [...roleKeys.list(), ...queryParamsToArray(opts)],
    queryFn: async () => (await getApiClient().role.roleControllerSearch(opts)).data,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => hasNextPage(lastPage.meta),
  });
};

export const permissionsQueryOptions = () =>
  queryOptions<PermissionOutputDTO[], AxiosError<PermissionOutputDTOAPI>>({
    queryKey: roleKeys.permissions(),
    queryFn: async () => (await getApiClient().role.roleControllerGetPermissions()).data.data,
  });

export const useRoleCreate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<RoleOutputDTO, RoleCreateInputDTO>(
    useMutation<RoleOutputDTO, AxiosError<RoleOutputArrayDTOAPI>, RoleCreateInputDTO>({
      mutationFn: async (role) => (await apiClient.role.roleControllerCreate(role)).data.data,
      onSuccess: async (newRole) => {
        await queryClient.invalidateQueries({ queryKey: roleKeys.list() });
        queryClient.setQueryData(roleKeys.detail(newRole.id), newRole);
      },
    }),
    defaultRoleErrorMessages
  );
};

interface RoleUpdate {
  roleId: string;
  roleDetails: RoleUpdateInputDTO;
}

export const useRoleUpdate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<RoleOutputDTO, RoleUpdate>(
    useMutation<RoleOutputDTO, AxiosError<RoleOutputDTO>, RoleUpdate>({
      mutationFn: async ({ roleId, roleDetails }) => {
        return (await apiClient.role.roleControllerUpdate(roleId, roleDetails)).data.data;
      },
      onSuccess: async (updatedRole) => {
        queryClient.setQueryData<InfiniteData<RoleOutputArrayDTOAPI>>(roleKeys.list(), (prev) => {
          if (!prev) {
            queryClient.invalidateQueries({ queryKey: roleKeys.list() });
            throw new Error('Cannot update role list, because it does not exist');
          }

          return {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              data: page.data.map((role) => {
                if (role.id === updatedRole.id) {
                  return updatedRole;
                }
                return role;
              }),
            })),
          };
        });
        await queryClient.setQueryData(roleKeys.detail(updatedRole.id), updatedRole);
      },
    }),
    defaultRoleErrorMessages
  );
};

interface RoleRemove {
  id: string;
}

export const useRoleRemove = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<IdUuidDTO, RoleRemove>(
    useMutation<IdUuidDTO, AxiosError<IdUuidDTOAPI>, RoleRemove>({
      mutationFn: async ({ id }) => (await apiClient.role.roleControllerRemove(id)).data.data,
      onSuccess: (removedRole) => {
        queryClient.invalidateQueries({ queryKey: roleKeys.list() });
        queryClient.removeQueries({ queryKey: roleKeys.detail(removedRole.id) });
      },
    }),
    {}
  );
};

interface IPlayerRoleAssign {
  id: string;
  roleId: string;
  gameServerId?: string;
  expiresAt?: string;
}

export const usePlayerRoleAssign = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  return mutationWrapper<APIOutput, IPlayerRoleAssign>(
    useMutation<APIOutput, AxiosError<APIOutput>, IPlayerRoleAssign>({
      mutationFn: async ({ id, roleId, gameServerId, expiresAt }) => {
        const res = (await apiClient.player.playerControllerAssignRole(id, roleId, { gameServerId, expiresAt })).data;
        // TODO: _should_ happen in the onSuccess below I guess
        // But no access to the ID there
        // At this point, we technically already know the req was successful
        // because it would have thrown an error otherwise
        queryClient.invalidateQueries({ queryKey: playerKeys.detail(id) });
        return res;
      },
    }),
    {}
  );
};

export const usePlayerRoleUnassign = ({ playerId }: { playerId: string }) => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  return mutationWrapper<APIOutput, IPlayerRoleAssign>(
    useMutation<APIOutput, AxiosError<APIOutput>, IPlayerRoleAssign>({
      mutationFn: async ({ id, roleId, gameServerId }) => {
        const res = (await apiClient.player.playerControllerRemoveRole(id, roleId, { gameServerId })).data;
        // TODO: Same cache issue as in useRoleAssign...
        queryClient.invalidateQueries({ queryKey: playerKeys.detail(id) });
        return res;
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: playerKeys.detail(playerId) });
      },
    }),
    {}
  );
};

interface IUserRoleAssign {
  id: string;
  roleId: string;
}

export const useUserRoleAssign = ({ userId }: { userId: string }) => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  return mutationWrapper<APIOutput, IUserRoleAssign>(
    useMutation<APIOutput, AxiosError<APIOutput>, IUserRoleAssign>({
      mutationFn: async ({ id, roleId }) => {
        const res = (await apiClient.user.userControllerAssignRole(id, roleId)).data;
        return res;
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      },
    }),
    {}
  );
};

export const useUserRoleUnassign = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  return mutationWrapper<APIOutput, IUserRoleAssign>(
    useMutation<APIOutput, AxiosError<APIOutput>, IUserRoleAssign>({
      mutationFn: async ({ id, roleId }) => {
        const res = (await apiClient.user.userControllerRemoveRole(id, roleId)).data;
        queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
        return res;
      },
    }),
    {}
  );
};
