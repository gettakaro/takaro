import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { getApiClient } from '../util/getApiClient';
import {
  APIOutput,
  BanCreateDTO,
  BanOutputArrayDTOAPI,
  BanOutputDTO,
  BanSearchInputDTO,
  PlayerOutputArrayDTOAPI,
  PlayerOutputWithRolesDTO,
  PlayerRoleAssignChangeDTO,
  PlayerSearchInputDTO,
} from '@takaro/apiclient';
import { AxiosError } from 'axios';
import { getNextPage, mutationWrapper, queryParamsToArray } from '../queries/util';
import { useSnackbar } from 'notistack';
import { queryClient } from '../queryClient';

export const playerKeys = {
  all: ['players'] as const,
  list: () => [...playerKeys.all, 'list'] as const,
  detail: (playerId: string) => [...playerKeys.all, 'detail', playerId] as const,

  bans: {
    all: ['bans'] as const,
    list: () => [...playerKeys.bans.all, 'list'] as const,
    detail: (banId: string) => [...playerKeys.bans.all, 'detail', banId] as const,
  },
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

export const playersInfiniteQueryOptions = (queryParams: PlayerSearchInputDTO = {}) =>
  infiniteQueryOptions<PlayerOutputArrayDTOAPI, AxiosError<PlayerOutputArrayDTOAPI>>({
    queryKey: [...playerKeys.list(), 'infinite', ...queryParamsToArray(queryParams)],
    queryFn: async ({ pageParam }) =>
      (await getApiClient().player.playerControllerSearch({ ...queryParams, page: pageParam as number })).data,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => getNextPage(lastPage.meta),
    placeholderData: keepPreviousData,
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
    {},
  );
};

export const usePlayerRoleRemove = () => {
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
    {},
  );
};

export const playerBanQueryOptions = (banId: string) => {
  return queryOptions<BanOutputDTO, AxiosError<BanOutputDTO>>({
    queryKey: playerKeys.bans.detail(banId),
    queryFn: async () => (await getApiClient().player.banControllerGetOne(banId)).data.data,
  });
};

export const playerBansQueryOptions = (queryParams: BanSearchInputDTO = {}) =>
  queryOptions<BanOutputArrayDTOAPI, AxiosError<BanOutputArrayDTOAPI>>({
    queryKey: [...playerKeys.list(), ...queryParamsToArray(queryParams)],
    queryFn: async () => (await getApiClient().player.banControllerSearch(queryParams)).data,
  });

export const useBanPlayer = () => {
  const apiClient = getApiClient();

  return mutationWrapper<BanOutputDTO, BanCreateDTO>(
    useMutation<BanOutputDTO, AxiosError<BanOutputDTO>, BanCreateDTO>({
      mutationFn: async (ban) => (await apiClient.player.banControllerCreate(ban)).data.data,
      onSuccess: async (ban) => {
        queryClient.invalidateQueries({ queryKey: playerKeys.bans.list() });
        queryClient.setQueryData<BanOutputDTO>(playerKeys.bans.detail(ban.id), ban);
      },
    }),
    {},
  );
};

interface UnbanPlayerInput {
  banId: string;
}

export const useUnbanPlayer = () => {
  const apiClient = getApiClient();

  return mutationWrapper<APIOutput, UnbanPlayerInput>(
    useMutation<APIOutput, AxiosError<APIOutput>, UnbanPlayerInput>({
      mutationFn: async ({ banId }) => (await apiClient.player.banControllerDelete(banId)).data,
      onSuccess: async (_, { banId }) => {
        queryClient.invalidateQueries({ queryKey: playerKeys.bans.list() });
        queryClient.removeQueries({ queryKey: playerKeys.bans.detail(banId) });
      },
    }),
    {},
  );
};
