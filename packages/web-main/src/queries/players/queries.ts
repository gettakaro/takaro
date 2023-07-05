import { useInfiniteQuery, useQuery } from 'react-query';
import { useApiClient } from 'hooks/useApiClient';
import { PlayerOutputDTO, PlayerOutputDTOAPI, PlayerSearchInputDTO } from '@takaro/apiclient';
import { hasNextPage } from '../util';
import { AxiosError } from 'axios';

export const playerKeys = {
  all: ['players'] as const,
  list: () => [...playerKeys.all, 'list'] as const,
  detail: (id: string) => [...playerKeys.all, 'detail', id] as const,
};

export const usePlayers = ({ page = 0, ...playerSearchInputArgs }: PlayerSearchInputDTO = {}) => {
  const apiClient = useApiClient();

  return useInfiniteQuery({
    queryKey: playerKeys.list(),
    queryFn: async ({ pageParam = page }) =>
      (
        await apiClient.player.playerControllerSearch({
          ...playerSearchInputArgs,
          page: pageParam,
        })
      ).data,
    getNextPageParam: (lastPage, pages) => hasNextPage(lastPage.meta, pages.length),
  });
};

export const usePlayer = (id: string) => {
  const apiClient = useApiClient();

  return useQuery<PlayerOutputDTO, AxiosError<PlayerOutputDTOAPI>>({
    queryKey: playerKeys.detail(id),
    queryFn: async () => (await apiClient.player.playerControllerGetOne(id)).data.data,
  });
};
