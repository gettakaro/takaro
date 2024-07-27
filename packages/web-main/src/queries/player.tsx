import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiClient } from 'util/getApiClient';
import {
  APIOutput,
  PlayerOutputArrayDTOAPI,
  PlayerOutputWithRolesDTO,
  PlayerRoleAssignChangeDTO,
  PlayerSearchInputDTO,
} from '@takaro/apiclient';
import { AxiosError } from 'axios';
import { mutationWrapper, queryParamsToArray } from 'queries/util';
import { useSnackbar } from 'notistack';

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

interface IPlayerRoleAssign extends PlayerRoleAssignChangeDTO {
  playerId: string;
  roleId: string;
}

export const usePlayerRoleAssign = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return mutationWrapper<APIOutput, IPlayerRoleAssign>(
    useMutation<APIOutput, AxiosError<APIOutput>, IPlayerRoleAssign>({
      mutationFn: async ({ playerId, roleId, gameServerId, expiresAt }) =>
        (await apiClient.player.playerControllerAssignRole(playerId, roleId, { gameServerId, expiresAt })).data,
      onSuccess: (_, { playerId }) => {
        enqueueSnackbar('Role assigned to player!', { variant: 'default', type: 'success' });
        queryClient.invalidateQueries({ queryKey: playerKeys.detail(playerId) });
      },
    }),
    {}
  );
};

export const usePlayerRoleUnassign = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return mutationWrapper<APIOutput, IPlayerRoleAssign>(
    useMutation<APIOutput, AxiosError<APIOutput>, IPlayerRoleAssign>({
      mutationFn: async ({ playerId, roleId, gameServerId }) =>
        (await apiClient.player.playerControllerRemoveRole(playerId, roleId, { gameServerId })).data,
      onSuccess: async (_, { playerId }) => {
        enqueueSnackbar('Role removed from player!', { variant: 'default', type: 'success' });
        await queryClient.invalidateQueries({ queryKey: playerKeys.detail(playerId) });
      },
    }),
    {}
  );
};
