import { infiniteQueryOptions, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasNextPage, mutationWrapper, queryParamsToArray } from './util';
import {
  APIOutput,
  ShopOrderCreateDTO,
  ShopOrderOutputArrayDTOAPI,
  ShopOrderOutputDTO,
  ShopOrderSearchInputDTO,
  ShopOrderUpdateDTOStatusEnum,
} from '@takaro/apiclient';
import { AxiosError } from 'axios';
import { getApiClient } from 'util/getApiClient';
import { pogKeys } from './pog';

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
        // we could also potentially update this manually if a shopOrder can be extended with a listing!
        // this is required to update the currency of the pog.
        // TODO: this scope should be limited to the pog
        // but until now there is no data this can be achieved with.
        queryClient.invalidateQueries({ queryKey: pogKeys.all });
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
  const queryClient = useQueryClient();

  return mutationWrapper<APIOutput, ShopOrderCancel>(
    useMutation<APIOutput, AxiosError<APIOutput>, ShopOrderCancel>({
      mutationFn: async ({ shopOrderId }) =>
        (await getApiClient().shopOrder.shopOrderControllerCancel(shopOrderId)).data,
      onSuccess: (_, { shopOrderId }) => {
        // TODO: make scope smaller
        // cache invalidated to update the returned currency of the pog.
        queryClient.invalidateQueries({ queryKey: pogKeys.all });
        queryClient.invalidateQueries({ queryKey: shopOrderKeys.list() });

        const shopOrder = queryClient.getQueryData<ShopOrderOutputDTO>(shopOrderKeys.detail(shopOrderId));
        if (shopOrder) {
          const updatedShopOrder = {
            ...shopOrder,
            status: ShopOrderUpdateDTOStatusEnum.Canceled,
          } as ShopOrderOutputDTO;
          queryClient.setQueryData<ShopOrderOutputDTO>(shopOrderKeys.detail(shopOrderId), updatedShopOrder);
        }
      },
    }),
    {}
  );
};

interface ShopOrderClaim {
  shopOrderId: string;
}

export const useShopOrderClaim = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<ShopOrderOutputDTO, ShopOrderClaim>(
    useMutation<ShopOrderOutputDTO, AxiosError<ShopOrderOutputDTO>, ShopOrderClaim>({
      mutationFn: async ({ shopOrderId }) => {
        return (await apiClient.shopOrder.shopOrderControllerClaim(shopOrderId)).data.data;
      },
      onSuccess: async (_, { shopOrderId }) => {
        queryClient.invalidateQueries({ queryKey: shopOrderKeys.list() });
        const shopOrder = queryClient.getQueryData<ShopOrderOutputDTO>(shopOrderKeys.detail(shopOrderId));
        if (shopOrder) {
          const updatedShopOrder = {
            ...shopOrder,
            status: ShopOrderUpdateDTOStatusEnum.Completed,
          } as ShopOrderOutputDTO;
          queryClient.setQueryData<ShopOrderOutputDTO>(shopOrderKeys.detail(shopOrderId), updatedShopOrder);
        }
      },
    }),
    {}
  );
};
