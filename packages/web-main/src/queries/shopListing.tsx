import {
  APIOutput,
  ShopImportOptions,
  ShopListingCreateDTO,
  ShopListingOutputArrayDTOAPI,
  ShopListingOutputDTO,
  ShopListingSearchInputDTO,
  ShopListingUpdateDTO,
} from '@takaro/apiclient';
import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { getApiClient } from 'util/getApiClient';
import { getNextPage, mutationWrapper, queryParamsToArray } from './util';
import { useSnackbar } from 'notistack';

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

export const shopListingsQueryOptions = (queryParams: ShopListingSearchInputDTO) =>
  queryOptions<ShopListingOutputArrayDTOAPI, AxiosError<ShopListingOutputArrayDTOAPI>>({
    queryKey: [...shopListingKeys.list(), 'table', ...queryParamsToArray(queryParams)],
    queryFn: async () => (await getApiClient().shopListing.shopListingControllerSearch(queryParams)).data,
  });

export const shopListingInfiniteQueryOptions = (queryParams: ShopListingSearchInputDTO = {}) => {
  return infiniteQueryOptions<ShopListingOutputArrayDTOAPI, AxiosError<ShopListingOutputArrayDTOAPI>>({
    queryKey: [...shopListingKeys.list(), 'infinite', ...queryParamsToArray(queryParams)],
    queryFn: async ({ pageParam }) =>
      (await getApiClient().shopListing.shopListingControllerSearch({ ...queryParams, page: pageParam as number }))
        .data,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => getNextPage(lastPage.meta),
    placeholderData: keepPreviousData,
  });
};

export const useShopListingCreate = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<ShopListingOutputDTO, ShopListingCreateDTO>(
    useMutation<ShopListingOutputDTO, AxiosError<ShopListingOutputDTO>, ShopListingCreateDTO>({
      mutationFn: async (shopListing) =>
        (await getApiClient().shopListing.shopListingControllerCreate(shopListing)).data.data,
      onSuccess: (newShopListing) => {
        enqueueSnackbar('Shoplisting created!', { variant: 'default', type: 'success' });
        queryClient.invalidateQueries({ queryKey: shopListingKeys.list() });
        queryClient.setQueryData(shopListingKeys.detail(newShopListing.id), newShopListing);
      },
    }),
    {},
  );
};

interface ShopListingDelete {
  shopListingId: string;
}

export const useShopListingDelete = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<APIOutput, ShopListingDelete>(
    useMutation<APIOutput, AxiosError<APIOutput>, ShopListingDelete>({
      mutationFn: async ({ shopListingId }) =>
        (await getApiClient().shopListing.shopListingControllerDelete(shopListingId)).data,
      onSuccess: async (_, { shopListingId }) => {
        enqueueSnackbar('Shoplisting successfully deleted!', { variant: 'default', type: 'success' });
        await queryClient.invalidateQueries({ queryKey: shopListingKeys.list() });
        queryClient.removeQueries({ queryKey: shopListingKeys.detail(shopListingId) });
      },
    }),
    {},
  );
};

interface ShopListingUpdate {
  shopListingId: string;
  shopListingDetails: ShopListingUpdateDTO;
}

export const useShopListingUpdate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<ShopListingOutputDTO, ShopListingUpdate>(
    useMutation<ShopListingOutputDTO, AxiosError<ShopListingOutputDTO>, ShopListingUpdate>({
      mutationFn: async ({ shopListingId, shopListingDetails }: ShopListingUpdate) => {
        return (await apiClient.shopListing.shopListingControllerUpdate(shopListingId, shopListingDetails)).data.data;
      },
      onSuccess: async (updatedShopListing) => {
        enqueueSnackbar('Shoplisting updated!', { variant: 'default', type: 'success' });
        await queryClient.invalidateQueries({ queryKey: shopListingKeys.list() });
        queryClient.setQueryData(shopListingKeys.detail(updatedShopListing.id), updatedShopListing);
      },
    }),
    {},
  );
};

interface ShopListingImportProps extends ShopImportOptions {
  shopListings: ShopListingOutputDTO[];
}

export const useShopListingImport = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<APIOutput, ShopListingImportProps>(
    useMutation<APIOutput, AxiosError<ShopListingImportProps>, ShopListingImportProps>({
      mutationFn: async ({ gameServerId, replace, shopListings }) => {
        const formData = new FormData();
        formData.append('import', JSON.stringify(shopListings));
        formData.append('options', JSON.stringify({ replace, gameServerId }));
        return (await apiClient.shopListing.shopListingControllerImportListings({ data: formData })).data;
      },
      onSuccess: async () => {
        enqueueSnackbar('ShopListings imported!', { variant: 'default', type: 'success' });
        await queryClient.invalidateQueries({ queryKey: shopListingKeys.list() });
      },
    }),
    {},
  );
};
