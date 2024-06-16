import {
  IdUuidDTO,
  IdUuidDTOAPI,
  ItemCreateDTO,
  ItemOutputArrayDTOAPI,
  ItemSearchInputDTO,
  ItemsOutputDTO,
  ItemUpdateDTO,
} from '@takaro/apiclient';
import { useMutation, useQueryClient, queryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { getApiClient } from 'util/getApiClient';
import { mutationWrapper } from './util';

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

export const itemQueryOptions = (itemId: string) =>
  queryOptions<ItemsOutputDTO, AxiosError<ItemOutputArrayDTOAPI>>({
    queryKey: itemKeys.detail(itemId),
    queryFn: async () => (await getApiClient().item.itemControllerFindOne(itemId)).data.data,
  });

export const useItemCreate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<ItemsOutputDTO, ItemCreateDTO>(
    useMutation<ItemsOutputDTO, AxiosError<ItemsOutputDTO>, ItemCreateDTO>({
      mutationFn: async (item) => (await apiClient.item.itemControllerCreate(item)).data.data,
      onSuccess: (newItem) => {
        queryClient.invalidateQueries({ queryKey: itemKeys.list() });
        queryClient.setQueryData(itemKeys.detail(newItem.id), newItem);
      },
    }),
    {}
  );
};

interface ItemDelete {
  id: string;
}

export const useItemRemove = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<IdUuidDTO, ItemDelete>(
    useMutation<IdUuidDTO, AxiosError<IdUuidDTOAPI>, ItemDelete>({
      mutationFn: async ({ id }) => (await apiClient.item.itemControllerDelete(id)).data.data,
      onSuccess: async (removedItem: IdUuidDTO) => {
        await queryClient.invalidateQueries({ queryKey: itemKeys.list() });

        await queryClient.invalidateQueries({
          queryKey: itemKeys.detail(removedItem.id),
        });
      },
    }),
    {}
  );
};

interface ItemUpdate {
  itemId: string;
  itemDetails: ItemUpdateDTO;
}

export const useItemUpdate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<ItemsOutputDTO, ItemUpdate>(
    useMutation<ItemsOutputDTO, AxiosError<ItemsOutputDTO>, ItemUpdate>({
      mutationFn: async ({ itemId, itemDetails }: ItemUpdate) => {
        return (await apiClient.item.itemControllerUpdate(itemId, itemDetails)).data.data;
      },
      onSuccess: async (updatedItem) => {
        await queryClient.invalidateQueries({ queryKey: itemKeys.list() });
        queryClient.setQueryData(itemKeys.detail(updatedItem.id), updatedItem);
      },
    }),
    {}
  );
};
