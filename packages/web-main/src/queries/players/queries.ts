import { useInfiniteQuery, useQuery } from 'react-query';
import { useApiClient } from 'hooks/useApiClient';
import { PlayerOutputDTO } from '@takaro/apiclient';
import { hasNextPage } from '../util';

export const playerKeys = {
  all: ['players'] as const,
  list: () => [...playerKeys.all, 'list'] as const,
  detail: (id: string) => [...playerKeys.all, 'detail', id] as const,
};

export const usePlayers = () => {
  const apiClient = useApiClient();

  return useInfiniteQuery({
    queryKey: playerKeys.list(),
    queryFn: async ({ pageParam }) =>
      (await apiClient.player.playerControllerSearch({ page: pageParam })).data,
    getNextPageParam: (lastPage, pages) =>
      hasNextPage(lastPage.meta, pages.length),
  });
};

export const usePlayer = (id: string) => {
  const apiClient = useApiClient();

  return useQuery<PlayerOutputDTO>({
    queryKey: playerKeys.detail(id),
    queryFn: async () =>
      (await apiClient.player.playerControllerGetOne(id)).data.data,
  });
};
