import { queryOptions } from '@tanstack/react-query';
import { getApiClient } from 'util/getApiClient';
import {
  PlayerOnGameServerSearchInputDTO,
  PlayerOnGameserverOutputArrayDTOAPI,
  PlayerOutputArrayDTOAPI,
  PlayerOutputWithRolesDTO,
  PlayerSearchInputDTO,
} from '@takaro/apiclient';
import { AxiosError } from 'axios';
import { queryParamsToArray } from 'queries/util';

export const playerKeys = {
  all: ['players'] as const,
  list: () => [...playerKeys.all, 'list'] as const,
  detail: (id: string) => [...playerKeys.all, 'detail', id] as const,
  pogs: ['playerOnGameServers'] as const,
  pogsList: () => [...playerKeys.pogs, 'list'] as const,
};

export const playersOptions = (queryParams: PlayerSearchInputDTO = {}) =>
  queryOptions<PlayerOutputArrayDTOAPI, AxiosError<PlayerOutputArrayDTOAPI>>({
    queryKey: [...playerKeys.list(), ...queryParamsToArray(queryParams)],
    queryFn: async () => (await getApiClient().player.playerControllerSearch(queryParams)).data,
  });

export const playerOptions = (playerId: string) =>
  queryOptions<PlayerOutputWithRolesDTO, AxiosError<PlayerOutputWithRolesDTO>>({
    queryKey: playerKeys.detail(playerId),
    queryFn: async () => (await getApiClient().player.playerControllerGetOne(playerId)).data.data,
  });

export const playerOnGameServersOptions = (queryParams: PlayerOnGameServerSearchInputDTO) =>
  queryOptions<PlayerOnGameserverOutputArrayDTOAPI, AxiosError<PlayerOnGameserverOutputArrayDTOAPI>>({
    queryKey: [...playerKeys.pogsList(), { queryParams }],
    queryFn: async () => (await getApiClient().playerOnGameserver.playerOnGameServerControllerSearch(queryParams)).data,
  });
