import { queryOptions } from '@tanstack/react-query';
import { getApiClient } from 'util/getApiClient';
import { ActivityInputDTO, EventsCountInputDTO, StatsOutputDTO } from '@takaro/apiclient';
import { AxiosError } from 'axios';
import { queryParamsToArray } from './util';

type StatsOutput = { values: Array<[number, number]> };

export const statsKeys = {
  all: ['stats'] as const,
  ping: (playerId: string, gameServerId: string, startDate?: string, endDate?: string) =>
    [...statsKeys.all, 'ping', playerId, gameServerId, startDate, endDate] as const,
  currency: (gameServerId: string, playerId?: string, startDate?: string, endDate?: string) =>
    [...statsKeys.all, 'currency', playerId, gameServerId, startDate, endDate] as const,
  latency: (gameServerId: string, startDate?: string, endDate?: string) =>
    [...statsKeys.all, 'latency', gameServerId, startDate, endDate] as const,
  playersOnline: (gameServerId?: string, startDate?: string, endDate?: string) =>
    [...statsKeys.all, 'players-online', gameServerId, startDate, endDate] as const,
  activity: (gameServerId?: string) => [...statsKeys.all, 'activity', gameServerId] as const,
  countries: (gameServerIds: string[]) => [...statsKeys.all, 'countries', ...gameServerIds] as const,
  countriesGlobal: () => [...statsKeys.all, 'countries', 'global'] as const,
};

export const PingStatsQueryOptions = (playerId: string, gameServerId: string, startDate?: string, endDate?: string) => {
  return queryOptions<StatsOutputDTO, AxiosError<StatsOutputDTO>, StatsOutput>({
    queryKey: statsKeys.ping(playerId, gameServerId, startDate, endDate),
    queryFn: async () =>
      (await getApiClient().stats.statsControllerGetPingStats(gameServerId, playerId, startDate, endDate)).data.data,
  });
};

export const CurrencyStatsQueryOptions = (
  gameServerId: string,
  playerId?: string,
  startDate?: string,
  endDate?: string,
) => {
  return queryOptions<StatsOutputDTO, AxiosError<StatsOutputDTO>, StatsOutput>({
    queryKey: statsKeys.currency(gameServerId, playerId, startDate, endDate),
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
          options.sumBy,
          options.gameServerId,
          options.moduleId,
          options.playerId,
          options.userId,
          options.startDate,
          options.endDate,
        )
      ).data.data,
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
          options.endDate,
        )
      ).data.data,
  });
};

type CountryValue = { country: string; playerCount: string };
export const CountriesStatsQueryOptions = ({ gameServerIds = [] }: { gameServerIds?: string[] }) => {
  return queryOptions<CountryValue[], AxiosError<CountryValue[]>, CountryValue[]>({
    queryKey: [statsKeys.countries(gameServerIds)],
    queryFn: async () =>
      (await getApiClient().stats.statsControllerGetCountryStats(gameServerIds)).data.data.values as CountryValue[],
  });
};
