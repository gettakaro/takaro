import { useQuery } from '@tanstack/react-query';
import { getApiClient } from 'util/getApiClient';
import { StatsOutputDTO } from '@takaro/apiclient';
import { AxiosError } from 'axios';

type StatsOutput = { values: Array<[number, number]> };

export const statsKeys = {
  ping: (playerId: string, gameServerId: string) => ['ping', playerId, gameServerId] as const,
  currency: (playerId: string, gameServerId: string) => ['currency', playerId, gameServerId] as const,
  playersOnline: (gameServerId?: string) => ['players-online', gameServerId] as const,
};

export const usePingStats = (playerId: string, gameServerId: string) => {
  return useQuery<StatsOutputDTO, AxiosError<StatsOutputDTO>, StatsOutput>({
    queryKey: statsKeys.ping(playerId, gameServerId),
    queryFn: async () => (await getApiClient().stats.statsControllerGetPingStats(gameServerId, playerId)).data.data,
  });
};

export const useCurrencyStats = (playerId: string, gameServerId: string) => {
  return useQuery<StatsOutputDTO, AxiosError<StatsOutputDTO>, StatsOutput>({
    queryKey: statsKeys.currency(playerId, gameServerId),
    queryFn: async () => (await getApiClient().stats.statsControllerGetCurrencyStats(gameServerId, playerId)).data.data,
  });
};

export const usePlayersOnlineStats = (gameServerId?: string) => {
  return useQuery<StatsOutputDTO, AxiosError<StatsOutputDTO>, StatsOutput>({
    queryKey: statsKeys.playersOnline(gameServerId),
    queryFn: async () => (await getApiClient().stats.statsControllerGetPlayerOnlineStats(gameServerId)).data.data,
  });
};
