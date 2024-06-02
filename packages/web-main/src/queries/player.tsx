import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiClient } from 'util/getApiClient';
import { APIOutput, PlayerOutputArrayDTOAPI, PlayerOutputWithRolesDTO, PlayerSearchInputDTO } from '@takaro/apiclient';
import { AxiosError } from 'axios';
import { mutationWrapper, queryParamsToArray } from 'queries/util';

export const playerKeys = {
  all: ['players'] as const,
  list: () => [...playerKeys.all, 'list'] as const,
  detail: (id: string) => [...playerKeys.all, 'detail', id] as const,
};

export const playerQueryOptions = (playerId: string) =>
  queryOptions<PlayerOutputWithRolesDTO, AxiosError<PlayerOutputWithRolesDTO>>({
    queryKey: playerKeys.detail(playerId),
    queryFn: async () => (await getApiClient().player.playerControllerGetOne(playerId)).data.data,
  });

export const playersQueryOptions = (queryParams: PlayerSearchInputDTO = {}) =>
  queryOptions<PlayerOutputArrayDTOAPI, AxiosError<PlayerOutputArrayDTOAPI>>({
    queryKey: [...playerKeys.list(), ...queryParamsToArray(queryParams)],
    queryFn: async () => (await getApiClient().player.playerControllerSearch(queryParams)).data,
  });

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
