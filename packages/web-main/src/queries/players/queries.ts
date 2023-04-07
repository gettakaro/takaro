import { useQuery } from 'react-query';
import { useApiClient } from 'hooks/useApiClient';
import { PlayerOutputDTO } from '@takaro/apiclient';

export const playerKeys = {
  all: ['players'] as const,
  list: () => [...playerKeys.all, 'list'] as const,
  detail: (id: string) => [...playerKeys.all, 'detail', id] as const,
};

// TODO: add filters
export const usePlayers = () => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: playerKeys.list(),
    queryFn: async () => await apiClient.player.playerControllerSearch(),
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
