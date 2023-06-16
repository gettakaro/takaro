import { useQuery } from 'react-query';
import { useApiClient } from 'hooks/useApiClient';
import { PlayerOutputDTO } from '@takaro/apiclient';
import { TakaroError } from 'queries/errorType';

export const playerKeys = {
  all: ['players'] as const,
  list: () => [...playerKeys.all, 'list'] as const,
  detail: (id: string) => [...playerKeys.all, 'detail', id] as const,
};

// TODO: add filters
export const usePlayers = () => {
  const apiClient = useApiClient();

  return useQuery<PlayerOutputDTO[], TakaroError>({
    queryKey: playerKeys.list(),
    queryFn: async () =>
      (await apiClient.player.playerControllerSearch()).data.data,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

export const usePlayer = (id: string) => {
  const apiClient = useApiClient();

  return useQuery<PlayerOutputDTO, TakaroError>({
    queryKey: playerKeys.detail(id),
    queryFn: async () =>
      (await apiClient.player.playerControllerGetOne(id)).data.data,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};
