import { queryOptions } from '@tanstack/react-query';
import { getApiClient } from '../util/getApiClient';
import { ShopAnalyticsOutputDTO, AnalyticsControllerGetShopAnalyticsPeriodEnum } from '@takaro/apiclient';
import { AxiosError } from 'axios';

const analyticsKeys = {
  all: ['analytics'] as const,
  shop: (gameServerIds?: string[], period?: AnalyticsControllerGetShopAnalyticsPeriodEnum) =>
    [...analyticsKeys.all, 'shop', gameServerIds, period] as const,
};

export const shopAnalyticsQueryOptions = (
  gameServerIds?: string[],
  period: AnalyticsControllerGetShopAnalyticsPeriodEnum = AnalyticsControllerGetShopAnalyticsPeriodEnum.Last30Days,
) => {
  return queryOptions<ShopAnalyticsOutputDTO, AxiosError<ShopAnalyticsOutputDTO>, ShopAnalyticsOutputDTO>({
    queryKey: analyticsKeys.shop(gameServerIds, period),
    queryFn: async () => {
      const apiClient = getApiClient();
      // Using the generated analytics API
      const response = await apiClient.analytics.analyticsControllerGetShopAnalytics(gameServerIds, period);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  });
};
