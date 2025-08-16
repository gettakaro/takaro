import { queryOptions } from '@tanstack/react-query';
import { getApiClient } from '../util/getApiClient';
import { ShopAnalyticsOutputDTO, ShopAnalyticsPeriod } from '@takaro/apiclient';
import { AxiosError } from 'axios';

const analyticsKeys = {
  all: ['analytics'] as const,
  shop: (gameServerIds?: string[], period?: ShopAnalyticsPeriod) =>
    [...analyticsKeys.all, 'shop', gameServerIds, period] as const,
};

export const shopAnalyticsQueryOptions = (
  gameServerIds?: string[],
  period: ShopAnalyticsPeriod = ShopAnalyticsPeriod.LAST_30_DAYS,
) => {
  return queryOptions<ShopAnalyticsOutputDTO, AxiosError<ShopAnalyticsOutputDTO>, ShopAnalyticsOutputDTO>({
    queryKey: analyticsKeys.shop(gameServerIds, period),
    queryFn: async () => {
      const apiClient = getApiClient();
      // Using the generated analytics API
      const response = await apiClient.analytics.analyticsControllerGetShopAnalytics(gameServerIds, period);
      return response.data.data;
    },
    staleTime: 30 * 1000, // 30 seconds for auto-refresh
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  });
};
