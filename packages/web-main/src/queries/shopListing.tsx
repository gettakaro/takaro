import {
  APIOutput,
  ShopListingCreateDTO,
  ShopListingOutputArrayDTOAPI,
  ShopListingOutputDTO,
  ShopListingSearchInputDTO,
  ShopListingUpdateDTO,
} from '@takaro/apiclient';
import { infiniteQueryOptions, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { getApiClient } from 'util/getApiClient';
import { hasNextPage, mutationWrapper, queryParamsToArray } from './util';

export const shopListingKeys = {
  all: ['shopListing'] as const,
  list: () => [...shopListingKeys.all, 'list'] as const,
  detail: (shopListingId: string) => [...shopListingKeys.all, 'detail', shopListingId] as const,
};

export const shopListingQueryOptions = (shopListingId: string) =>
  queryOptions<ShopListingOutputDTO, AxiosError<ShopListingOutputDTO>>({
    queryKey: shopListingKeys.detail(shopListingId),
    queryFn: async () => (await getApiClient().shopListing.shopListingControllerGetOne(shopListingId)).data.data,
  });

export const shopListingInfiniteQueryOptions = (queryParams: ShopListingSearchInputDTO = {}) => {
  return infiniteQueryOptions<ShopListingOutputArrayDTOAPI, AxiosError<ShopListingOutputArrayDTOAPI>>({
    queryKey: [...shopListingKeys.list(), 'infinite', ...queryParamsToArray(queryParams)],
    queryFn: async () => (await getApiClient().shopListing.shopListingControllerSearch(queryParams)).data,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => hasNextPage(lastPage.meta),
  });
};

export const useShopListingCreate = () => {
  const queryClient = useQueryClient();

  return mutationWrapper<ShopListingOutputDTO, ShopListingCreateDTO>(
    useMutation<ShopListingOutputDTO, AxiosError<ShopListingOutputDTO>, ShopListingCreateDTO>({
      mutationFn: async (shopListing) =>
        (await getApiClient().shopListing.shopListingControllerCreate(shopListing)).data.data,
      onSuccess: (newShopListing) => {
        queryClient.invalidateQueries({ queryKey: shopListingKeys.list() });
        queryClient.setQueryData(shopListingKeys.detail(newShopListing.id), newShopListing);
      },
    }),
    {}
  );
};

interface ShopListingDelete {
  id: string;
}

export const useShopListingDelete = () => {
  return mutationWrapper<APIOutput, ShopListingDelete>(
    useMutation<APIOutput, AxiosError<APIOutput>, ShopListingDelete>({
      mutationFn: async ({ id }) => (await getApiClient().shopListing.shopListingControllerDelete(id)).data,
      onSuccess: async () => {
        // await queryClient.invalidateQueries({ queryKey: shopListingKeys.list() });
        //await queryClient.invalidateQueries({
        //  queryKey: shopListingKeys.detail(removedShopListing.id),
        //});
      },
    }),
    {}
  );
};

interface ShopListingUpdate {
  shopListingId: string;
  shopListingDetails: ShopListingUpdateDTO;
}

export const useShopListingUpdate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<ShopListingOutputDTO, ShopListingUpdate>(
    useMutation<ShopListingOutputDTO, AxiosError<ShopListingOutputDTO>, ShopListingUpdate>({
      mutationFn: async ({ shopListingId, shopListingDetails }: ShopListingUpdate) => {
        return (await apiClient.shopListing.shopListingControllerUpdate(shopListingId, shopListingDetails)).data.data;
      },
      onSuccess: async (updatedShopListing) => {
        await queryClient.invalidateQueries({ queryKey: shopListingKeys.list() });
        queryClient.setQueryData(shopListingKeys.detail(updatedShopListing.id), updatedShopListing);
      },
    }),
    {}
  );
};
