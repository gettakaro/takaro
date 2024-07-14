import { ItemOutputArrayDTOAPI, ItemSearchInputDTO, ItemsOutputDTO } from '@takaro/apiclient';
import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { getApiClient } from 'util/getApiClient';
import { hasNextPage, queryParamsToArray } from './util';

export const itemKeys = {
  all: ['items'] as const,
  list: () => [...itemKeys.all] as const,
  detail: (id: string) => [...itemKeys.all, id] as const,
};

export const itemsQueryOptions = (queryParams: ItemSearchInputDTO) =>
  queryOptions<ItemOutputArrayDTOAPI, AxiosError<ItemOutputArrayDTOAPI>>({
    queryKey: [...itemKeys.list(), { ...queryParams }],
    queryFn: async () => (await getApiClient().item.itemControllerSearch(queryParams)).data,
  });

export const ItemsInfiniteQueryOptions = (queryParams: ItemSearchInputDTO = {}) => {
  return infiniteQueryOptions<ItemOutputArrayDTOAPI, AxiosError<ItemOutputArrayDTOAPI>>({
    queryKey: [...itemKeys.list(), 'infinite', ...queryParamsToArray(queryParams)],
    queryFn: async () => (await getApiClient().item.itemControllerSearch(queryParams)).data,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => hasNextPage(lastPage.meta),
  });
};

export const itemQueryOptions = (itemId: string) =>
  queryOptions<ItemsOutputDTO, AxiosError<ItemOutputArrayDTOAPI>>({
    queryKey: itemKeys.detail(itemId),
    queryFn: async () => (await getApiClient().item.itemControllerFindOne(itemId)).data.data,
  });
