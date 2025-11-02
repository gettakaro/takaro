import {
  APIOutput,
  ShopCategoryCreateDTO,
  ShopCategoryOutputArrayDTOAPI,
  ShopCategoryOutputDTO,
  ShopCategorySearchInputDTO,
  ShopCategoryUpdateDTO,
  ShopCategoryMoveDTO,
  ShopCategoryBulkAssignDTO,
} from '@takaro/apiclient';
import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
  useQuery,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { getApiClient } from '../util/getApiClient';
import { getNextPage, mutationWrapper, queryParamsToArray } from './util';
import { useSnackbar } from 'notistack';
import { shopListingKeys } from './shopListing';

export const shopCategoryKeys = {
  all: ['shopCategory'] as const,
  list: () => [...shopCategoryKeys.all, 'list'] as const,
  detail: (shopCategoryId: string) => [...shopCategoryKeys.all, 'detail', shopCategoryId] as const,
};

export const shopCategoryQueryOptions = (shopCategoryId: string) =>
  queryOptions<ShopCategoryOutputDTO, AxiosError<ShopCategoryOutputDTO>>({
    queryKey: shopCategoryKeys.detail(shopCategoryId),
    queryFn: async () => (await getApiClient().shopCategory.shopCategoryControllerGetOne(shopCategoryId)).data.data,
  });

export const shopCategoriesQueryOptions = (queryParams: ShopCategorySearchInputDTO = {}, gameServerId?: string) =>
  queryOptions<ShopCategoryOutputArrayDTOAPI, AxiosError<ShopCategoryOutputArrayDTOAPI>>({
    queryKey: [...shopCategoryKeys.list(), 'table', gameServerId, ...queryParamsToArray(queryParams)],
    queryFn: async () => {
      return (await getApiClient().shopCategory.shopCategoryControllerGetAll(gameServerId)).data;
    },
  });

export const shopCategoryInfiniteQueryOptions = (queryParams: ShopCategorySearchInputDTO = {}) => {
  return infiniteQueryOptions<ShopCategoryOutputArrayDTOAPI, AxiosError<ShopCategoryOutputArrayDTOAPI>>({
    queryKey: [...shopCategoryKeys.list(), 'infinite', ...queryParamsToArray(queryParams)],
    queryFn: async ({ pageParam: _pageParam }) =>
      (await getApiClient().shopCategory.shopCategoryControllerGetAll()).data,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => getNextPage(lastPage.meta),
    placeholderData: keepPreviousData,
  });
};

export const useShopCategories = () => {
  return useQuery(shopCategoriesQueryOptions());
};

export const useShopCategory = ({ categoryId }: { categoryId: string }, options?: any) => {
  return useQuery({
    ...shopCategoryQueryOptions(categoryId),
    ...options,
  });
};

export const useShopCategoryCreate = () => {
  const queryClient = useQueryClient();

  return mutationWrapper<ShopCategoryOutputDTO, ShopCategoryCreateDTO>(
    useMutation<ShopCategoryOutputDTO, AxiosError<ShopCategoryOutputDTO>, ShopCategoryCreateDTO>({
      mutationFn: async (shopCategory) =>
        (await getApiClient().shopCategory.shopCategoryControllerCreate(shopCategory)).data.data,
      onSuccess: (newShopCategory) => {
        queryClient.invalidateQueries({ queryKey: shopCategoryKeys.list() });
        queryClient.setQueryData(shopCategoryKeys.detail(newShopCategory.id), newShopCategory);
      },
    }),
    {},
  );
};

interface ShopCategoryDelete {
  shopCategoryId: string;
}

export const useShopCategoryDelete = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<APIOutput, ShopCategoryDelete>(
    useMutation<APIOutput, AxiosError<APIOutput>, ShopCategoryDelete>({
      mutationFn: async ({ shopCategoryId }) => {
        await getApiClient().shopCategory.shopCategoryControllerRemove(shopCategoryId);
        return {} as APIOutput; // DELETE endpoints typically return empty response
      },
      onSuccess: async (_, { shopCategoryId }) => {
        enqueueSnackbar('Category successfully deleted!', { variant: 'default', type: 'success' });
        await queryClient.invalidateQueries({ queryKey: shopCategoryKeys.list() });
        queryClient.removeQueries({ queryKey: shopCategoryKeys.detail(shopCategoryId) });
      },
    }),
    {},
  );
};

interface ShopCategoryUpdate {
  shopCategoryId: string;
  shopCategoryDetails: ShopCategoryUpdateDTO;
}

export const useShopCategoryUpdate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<ShopCategoryOutputDTO, ShopCategoryUpdate>(
    useMutation<ShopCategoryOutputDTO, AxiosError<ShopCategoryOutputDTO>, ShopCategoryUpdate>({
      mutationFn: async ({ shopCategoryId, shopCategoryDetails }) =>
        (await apiClient.shopCategory.shopCategoryControllerUpdate(shopCategoryId, shopCategoryDetails)).data.data,
      onSuccess: async (updatedCategory) => {
        enqueueSnackbar('Category updated!', { variant: 'default', type: 'success' });
        await queryClient.invalidateQueries({ queryKey: shopCategoryKeys.list() });
        queryClient.setQueryData(shopCategoryKeys.detail(updatedCategory.id), updatedCategory);
      },
    }),
    {},
  );
};

interface ShopCategoryMove {
  shopCategoryId: string;
  moveDetails: ShopCategoryMoveDTO;
}

export const useShopCategoryMove = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<ShopCategoryOutputDTO, ShopCategoryMove>(
    useMutation<ShopCategoryOutputDTO, AxiosError<ShopCategoryOutputDTO>, ShopCategoryMove>({
      mutationFn: async ({ shopCategoryId, moveDetails }) =>
        (await apiClient.shopCategory.shopCategoryControllerMove(shopCategoryId, moveDetails)).data.data,
      onSuccess: async (movedCategory) => {
        enqueueSnackbar('Category moved!', { variant: 'default', type: 'success' });
        await queryClient.invalidateQueries({ queryKey: shopCategoryKeys.list() });
        queryClient.setQueryData(shopCategoryKeys.detail(movedCategory.id), movedCategory);
      },
    }),
    {},
  );
};

// Helper hook to get all categories in a tree structure
export const useShopCategoriesTree = () => {
  const queryParams: ShopCategorySearchInputDTO = {
    limit: 100, // Get all categories since we have a 100 limit
    extend: ['parent', 'children'],
  };

  return shopCategoriesQueryOptions(queryParams);
};

interface ShopCategoryBulkAssign {
  bulkAssignDTO: ShopCategoryBulkAssignDTO;
}

export const useShopCategoryBulkAssign = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<APIOutput, ShopCategoryBulkAssign>(
    useMutation<APIOutput, AxiosError<APIOutput>, ShopCategoryBulkAssign>({
      mutationFn: async ({ bulkAssignDTO }) => {
        await apiClient.shopCategory.shopCategoryControllerBulkAssign(bulkAssignDTO);
        return {} as APIOutput; // Bulk assign endpoints typically return empty response
      },
      onSuccess: async () => {
        enqueueSnackbar('Categories assigned successfully!', { variant: 'default', type: 'success' });
        // Invalidate shop listings as their categories have changed
        await queryClient.invalidateQueries({ queryKey: shopListingKeys.all });
        // Also invalidate categories in case counts have changed
        await queryClient.invalidateQueries({ queryKey: shopCategoryKeys.list() });
      },
    }),
    {},
  );
};
