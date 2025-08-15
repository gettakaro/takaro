import { queryOptions } from '@tanstack/react-query';
import { getApiClient } from '../util/getApiClient';
import { ShopAnalyticsOutputDTO } from '@takaro/apiclient';
import { AxiosError } from 'axios';

const analyticsKeys = {
  all: ['analytics'] as const,
  shop: (gameServerIds?: string[], startDate?: string, endDate?: string) =>
    [...analyticsKeys.all, 'shop', gameServerIds, startDate, endDate] as const,
};

export const shopAnalyticsQueryOptions = (gameServerIds?: string[], startDate?: string, endDate?: string) => {
  return queryOptions<ShopAnalyticsOutputDTO, AxiosError<ShopAnalyticsOutputDTO>, ShopAnalyticsOutputDTO>({
    queryKey: analyticsKeys.shop(gameServerIds, startDate, endDate),
    queryFn: async () => {
      const apiClient = getApiClient();
      // Using the generated analytics API
      const response = await apiClient.analytics.analyticsControllerGetShopAnalytics(gameServerIds, startDate, endDate);
      return response.data.data;
    },
    staleTime: 30 * 1000, // 30 seconds for auto-refresh
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });
};
