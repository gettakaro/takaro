import { queryOptions } from '@tanstack/react-query';
import { getApiClient } from 'util/getApiClient';
import { StatsOutputDTO, ActivityInputDTO } from '@takaro/apiclient';
import { AxiosError } from 'axios';
import { queryParamsToArray } from './util';

type StatsOutput = { values: Array<[number, number]> };

export const statsKeys = {
  ping: (playerId: string, gameServerId: string) => ['ping', playerId, gameServerId] as const,
  currency: (playerId: string, gameServerId: string) => ['currency', playerId, gameServerId] as const,
  playersOnline: (gameServerId?: string) => ['players-online', gameServerId] as const,
  activity: (gameServerId?: string) => ['activity', gameServerId] as const,
};

export const PingStatsQueryOptions = (playerId: string, gameServerId: string) => {
  return queryOptions<StatsOutputDTO, AxiosError<StatsOutputDTO>, StatsOutput>({
    queryKey: statsKeys.ping(playerId, gameServerId),
    queryFn: async () => (await getApiClient().stats.statsControllerGetPingStats(gameServerId, playerId)).data.data,
  });
};

export const CurrencyStatsQueryOptions = (playerId: string, gameServerId: string) => {
  return queryOptions<StatsOutputDTO, AxiosError<StatsOutputDTO>, StatsOutput>({
    queryKey: statsKeys.currency(playerId, gameServerId),
    queryFn: async () => (await getApiClient().stats.statsControllerGetCurrencyStats(gameServerId, playerId)).data.data,
  });
};

export const PlayersOnlineStatsQueryOptions = (gameServerId?: string) => {
  return queryOptions<StatsOutputDTO, AxiosError<StatsOutputDTO>, StatsOutput>({
    queryKey: statsKeys.playersOnline(gameServerId),
    queryFn: async () => (await getApiClient().stats.statsControllerGetPlayerOnlineStats(gameServerId)).data.data,
  });
};

export const ActivityStatsQueryOptions = (options: ActivityInputDTO) => {
  return queryOptions<StatsOutputDTO, AxiosError<StatsOutputDTO>, StatsOutput>({
    queryKey: [statsKeys.activity(options.gameServerId), queryParamsToArray(options)],
    queryFn: async () =>
      (
        await getApiClient().stats.statsControllerGetActivityStats(
          options.timeType,
          options.dataType,
          options.gameServerId,
          options.startDate,
          options.endDate
        )
      ).data.data,
  });
};
