import { infiniteQueryOptions, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasNextPage, mutationWrapper, queryParamsToArray } from './util';
import {
  APIOutput,
  ShopOrderCreateDTO,
  ShopOrderOutputArrayDTOAPI,
  ShopOrderOutputDTO,
  ShopOrderSearchInputAllowedFilters,
} from '@takaro/apiclient';
import { AxiosError } from 'axios';
import { getApiClient } from 'util/getApiClient';

export const shopOrderKeys = {
  list: () => ['shopOrder'],
  detail: (shopOrderId: string) => ['shopOrder', shopOrderId],
};

export const shopOrderQueryOptions = (shopOrderId: string) =>
  queryOptions<ShopOrderOutputDTO, AxiosError<ShopOrderOutputDTO>>({
    queryKey: shopOrderKeys.detail(shopOrderId),
    queryFn: async () => (await getApiClient().shopOrder.shopOrderControllerGetOrder(shopOrderId)).data.data,
  });

export const shopListingInfiniteQueryOptions = (queryParams: ShopOrderSearchInputAllowedFilters = {}) => {
  return infiniteQueryOptions<ShopOrderOutputArrayDTOAPI, AxiosError<ShopOrderOutputArrayDTOAPI>>({
    queryKey: [...shopOrderKeys.list(), 'infinite', ...queryParamsToArray(queryParams)],

    // TODO; pass queryParams
    queryFn: async () => (await getApiClient().shopOrder.shopOrderControllerSearchOrder()).data,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => hasNextPage(lastPage.meta),
  });
};

export const useShopOrderCreate = () => {
  const queryClient = useQueryClient();

  return mutationWrapper<ShopOrderOutputDTO, ShopOrderCreateDTO>(
    useMutation<ShopOrderOutputDTO, AxiosError<ShopOrderOutputDTO>, ShopOrderCreateDTO>({
      mutationFn: async (shopOrder) =>
        (await getApiClient().shopOrder.shopOrderControllerCreateOrder(shopOrder)).data.data,
      onSuccess: (newShopOrder) => {
        queryClient.invalidateQueries({ queryKey: shopOrderKeys.list() });
        queryClient.setQueryData(shopOrderKeys.detail(newShopOrder.id), newShopOrder);
      },
    }),
    {}
  );
};

interface ShopOrderDelete {
  shopOrderId: string;
}
export const useShopOrderCancel = () => {
  return mutationWrapper<APIOutput, ShopOrderOutputDTO>(
    useMutation<APIOutput, AxiosError<APIOutput>, ShopOrderDelete>({
      mutationFn: async ({ shopOrderId }) =>
        (await getApiClient().shopOrder.shopOrderControllerCancel(shopOrderId)).data,
    }),
    {}
  );
};

interface ShopOrderUpdate {
  shopOrderId: string;
}

export const useShopOrderClaim = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<ShopOrderOutputDTO, ShopOrderUpdate>(
    useMutation<ShopOrderOutputDTO, AxiosError<ShopOrderOutputDTO>, ShopOrderUpdate>({
      mutationFn: async ({ shopOrderId }) => {
        return (await apiClient.shopOrder.shopOrderControllerClaim(shopOrderId)).data.data;
      },
      onSuccess: async (updatedShopListing) => {
        await queryClient.invalidateQueries({ queryKey: shopOrderKeys.list() });
        queryClient.setQueryData(shopOrderKeys.detail(updatedShopListing.id), updatedShopListing);
      },
    }),
    {}
  );
};
