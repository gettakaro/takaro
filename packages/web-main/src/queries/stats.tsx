import { queryOptions } from '@tanstack/react-query';
import { getApiClient } from 'util/getApiClient';
import { ActivityInputDTO, EventsCountInputDTO, StatsOutputDTO } from '@takaro/apiclient';
import { AxiosError } from 'axios';

type StatsOutput = { values: Array<[number, number]> };

export const statsKeys = {
  ping: (playerId: string, gameServerId: string, startDate?: string, endDate?: string) =>
    ['ping', playerId, gameServerId, startDate, endDate] as const,
  currency: (playerId: string, gameServerId: string, startDate?: string, endDate?: string) =>
    ['currency', playerId, gameServerId, startDate, endDate] as const,
  latency: (gameServerId: string, startDate?: string, endDate?: string) =>
    ['latency', gameServerId, startDate, endDate] as const,
  playersOnline: (gameServerId?: string, startDate?: string, endDate?: string) =>
    ['players-online', gameServerId, startDate, endDate] as const,
};

export const PingStatsQueryOptions = (playerId: string, gameServerId: string, startDate?: string, endDate?: string) => {
  return queryOptions<StatsOutputDTO, AxiosError<StatsOutputDTO>, StatsOutput>({
    queryKey: statsKeys.ping(playerId, gameServerId, startDate, endDate),
    queryFn: async () =>
      (await getApiClient().stats.statsControllerGetPingStats(gameServerId, playerId, startDate, endDate)).data.data,
  });
};

export const CurrencyStatsQueryOptions = (
  playerId: string,
  gameServerId: string,
  startDate?: string,
  endDate?: string
) => {
  return queryOptions<StatsOutputDTO, AxiosError<StatsOutputDTO>, StatsOutput>({
    queryKey: statsKeys.currency(playerId, gameServerId, startDate, endDate),
    queryFn: async () =>
      (await getApiClient().stats.statsControllerGetCurrencyStats(gameServerId, playerId, startDate, endDate)).data
        .data,
  });
};

export const LatencyStatsQueryOptions = (gameServerId: string, startDate?: string, endDate?: string) => {
  return queryOptions<StatsOutputDTO, AxiosError<StatsOutputDTO>, StatsOutput>({
    queryKey: statsKeys.latency(gameServerId, startDate, endDate),
    queryFn: async () =>
      (await getApiClient().stats.statsControllerGetLatencyStats(gameServerId, startDate, endDate)).data.data,
  });
};

export const PlayersOnlineStatsQueryOptions = (gameServerId?: string, startDate?: string, endDate?: string) => {
  return queryOptions<StatsOutputDTO, AxiosError<StatsOutputDTO>, StatsOutput>({
    queryKey: statsKeys.playersOnline(gameServerId, startDate, endDate),
    queryFn: async () =>
      (await getApiClient().stats.statsControllerGetPlayerOnlineStats(gameServerId, startDate, endDate)).data.data,
  });
};

export const EventsCountQueryOptions = (options: EventsCountInputDTO) => {
  return queryOptions<StatsOutputDTO, AxiosError<StatsOutputDTO>, StatsOutput>({
    queryKey: ['events', options],
    queryFn: async () =>
      (
        await getApiClient().stats.statsControllerGetEventsCount(
          options.eventName,
          options.bucketStep,
          options.gameServerId,
          options.moduleId,
          options.playerId,
          options.userId,
          options.startDate,
          options.endDate
        )
      ).data.data,
  });
};

export const ActivityStatsQueryOptions = (options: ActivityInputDTO) => {
  return queryOptions<StatsOutputDTO, AxiosError<StatsOutputDTO>, StatsOutput>({
    queryKey: ['activity', options],
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
