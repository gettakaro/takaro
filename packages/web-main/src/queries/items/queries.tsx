import {
  IdUuidDTO,
  IdUuidDTOAPI,
  ItemCreateDTO,
  ItemOutputArrayDTOAPI,
  ItemSearchInputDTO,
  ItemsOutputDTO,
  ItemUpdateDTO,
} from '@takaro/apiclient';
import { useInfiniteQuery, useMutation, useQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useApiClient } from 'hooks/useApiClient';
import { hasNextPage } from '../util';

import { InfiniteScroll as InfiniteScrollComponent } from '@takaro/lib-components';
import { useMemo } from 'react';

export const itemKeys = {
  all: ['items'] as const,
  list: () => [...itemKeys.all] as const,
  detail: (id: string) => [...itemKeys.all, id] as const,
};

export const useItems = (queryParams: ItemSearchInputDTO = { page: 0 }, opts?: any) => {
  const apiClient = useApiClient();

  const queryOpts = useInfiniteQuery<ItemOutputArrayDTOAPI, AxiosError<ItemOutputArrayDTOAPI>>({
    queryKey: [...itemKeys.list(), { ...queryParams }],
    queryFn: async ({ pageParam }) =>
      (
        await apiClient.item.itemControllerSearch({
          ...queryParams,
          page: pageParam as number,
        })
      ).data,
    initialPageParam: queryParams.page,
    placeholderData: keepPreviousData,
    getNextPageParam: (lastPage, pages) => hasNextPage(lastPage.meta, pages.length),
    ...opts,
  });

  const InfiniteScroll = useMemo(() => {
    return <InfiniteScrollComponent {...queryOpts} />;
  }, [queryOpts]);

  return { ...queryOpts, InfiniteScroll };
};

export const useItem = (id: string) => {
  const apiClient = useApiClient();
  return useQuery<ItemsOutputDTO, AxiosError<ItemOutputArrayDTOAPI>>({
    queryKey: itemKeys.detail(id),
    queryFn: async () => {
      const resp = (await apiClient.item.itemControllerFindOne(id)).data.data;
      return resp;
    },
    enabled: Boolean(id),
  });
};

export const useItemCreate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<ItemsOutputDTO, AxiosError<ItemsOutputDTO>, ItemCreateDTO>({
    mutationFn: async (item) => (await apiClient.item.itemControllerCreate(item)).data.data,
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: itemKeys.list() });
      queryClient.setQueryData(itemKeys.detail(newItem.id), newItem);
    },
  });
};

interface ItemDelete {
  id: string;
}

export const useGameServerRemove = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<IdUuidDTO, AxiosError<IdUuidDTOAPI>, ItemDelete>({
    mutationFn: async ({ id }) => (await apiClient.item.itemControllerDelete(id)).data.data,
    onSuccess: async (removedItem: IdUuidDTO) => {
      await queryClient.invalidateQueries({ queryKey: itemKeys.list() });

      await queryClient.invalidateQueries({
        queryKey: itemKeys.detail(removedItem.id),
      });
    },
  });
};

interface ItemUpdate {
  itemId: string;
  itemDetails: ItemUpdateDTO;
}

export const useGameServerUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<ItemsOutputDTO, AxiosError<ItemsOutputDTO>, ItemUpdate>({
    mutationFn: async ({ itemId, itemDetails }: ItemUpdate) => {
      return (await apiClient.item.itemControllerUpdate(itemId, itemDetails)).data.data;
    },
    onSuccess: async (updatedGameServer) => {
      // remove cache of gameserver list
      await queryClient.invalidateQueries({ queryKey: itemKeys.list() });

      // update cache of gameserver
      queryClient.setQueryData(itemKeys.detail(updatedGameServer.id), updatedGameServer);
    },
  });
};
