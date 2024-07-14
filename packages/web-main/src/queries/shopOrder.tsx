import { infiniteQueryOptions, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasNextPage, mutationWrapper, queryParamsToArray } from './util';
import {
  APIOutput,
  ShopOrderCreateDTO,
  ShopOrderOutputArrayDTOAPI,
  ShopOrderOutputDTO,
  ShopOrderSearchInputDTO,
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
    queryFn: async () => (await getApiClient().shopOrder.shopOrderControllerGetOne(shopOrderId)).data.data,
  });

export const shopOrdersQueryOptions = (queryParams: ShopOrderSearchInputDTO) =>
  queryOptions<ShopOrderOutputArrayDTOAPI, AxiosError<ShopOrderOutputArrayDTOAPI>>({
    queryKey: [...shopOrderKeys.list(), ...queryParamsToArray(queryParams)],
    queryFn: async () => (await getApiClient().shopOrder.shopOrderControllerSearch(queryParams)).data,
  });

export const shopOrderInfiniteQueryOptions = (queryParams: ShopOrderSearchInputDTO = {}) => {
  return infiniteQueryOptions<ShopOrderOutputArrayDTOAPI, AxiosError<ShopOrderOutputArrayDTOAPI>>({
    queryKey: [...shopOrderKeys.list(), 'infinite', ...queryParamsToArray(queryParams)],
    queryFn: async () => (await getApiClient().shopOrder.shopOrderControllerSearch(queryParams)).data,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => hasNextPage(lastPage.meta),
  });
};

export const useShopOrderCreate = () => {
  const queryClient = useQueryClient();

  return mutationWrapper<ShopOrderOutputDTO, ShopOrderCreateDTO>(
    useMutation<ShopOrderOutputDTO, AxiosError<ShopOrderOutputDTO>, ShopOrderCreateDTO>({
      mutationFn: async (shopOrder) => (await getApiClient().shopOrder.shopOrderControllerCreate(shopOrder)).data.data,
      onSuccess: (newShopOrder) => {
        queryClient.invalidateQueries({ queryKey: shopOrderKeys.list() });
        queryClient.setQueryData(shopOrderKeys.detail(newShopOrder.id), newShopOrder);
      },
    }),
    {}
  );
};

interface ShopOrderCancel {
  shopOrderId: string;
}
export const useShopOrderCancel = () => {
  return mutationWrapper<APIOutput, ShopOrderCancel>(
    useMutation<APIOutput, AxiosError<APIOutput>, ShopOrderCancel>({
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
