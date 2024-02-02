import { useInfiniteQuery, useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useApiClient } from 'hooks/useApiClient';
import {
  IdUuidDTO,
  VariableCreateDTO,
  VariableOutputArrayDTOAPI,
  VariableOutputDTO,
  VariableSearchInputDTO,
  VariableUpdateDTO,
} from '@takaro/apiclient';
import { hasNextPage } from '../util';
import { AxiosError } from 'axios';
import { useMemo } from 'react';
import { InfiniteScroll as InfiniteScrollComponent } from '@takaro/lib-components';

export const variableKeys = {
  all: ['variables'] as const,
  list: () => [...variableKeys.all, 'list'] as const,
  detail: (id: string) => [...variableKeys.all, 'detail', id] as const,
};

export const useInfiniteVariables = (queryParams: VariableSearchInputDTO = { page: 0 }) => {
  const apiClient = useApiClient();

  const queryOpts = useInfiniteQuery<VariableOutputArrayDTOAPI, AxiosError<VariableOutputArrayDTOAPI>>({
    queryKey: [...variableKeys.list(), { ...queryParams }],
    queryFn: async ({ pageParam }) =>
      (
        await apiClient.variable.variableControllerSearch({
          ...queryParams,
          page: pageParam as number,
        })
      ).data,
    initialPageParam: queryParams.page,
    getNextPageParam: (lastPage, pages) => hasNextPage(lastPage.meta, pages.length),
  });

  const InfiniteScroll = useMemo(() => {
    return <InfiniteScrollComponent {...queryOpts} />;
  }, [queryOpts]);

  return { ...queryOpts, InfiniteScroll };
};

export const useVariables = (queryParams: VariableSearchInputDTO = { page: 0 }) => {
  const apiClient = useApiClient();

  const queryOpts = useQuery<VariableOutputArrayDTOAPI, AxiosError<VariableOutputArrayDTOAPI>>({
    queryKey: [...variableKeys.list(), { queryParams }],
    queryFn: async () => (await apiClient.variable.variableControllerSearch(queryParams)).data,
    placeholderData: keepPreviousData,
  });
  return queryOpts;
};

export const useVariable = (id: string) => {
  const apiClient = useApiClient();

  return useQuery<VariableOutputDTO, AxiosError<VariableOutputDTO>>({
    queryKey: variableKeys.detail(id),
    queryFn: async () => {
      const resp = (await apiClient.variable.variableControllerFindOne(id)).data.data;
      return resp;
    },
    enabled: Boolean(id),
  });
};

export const useVariableCreate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<VariableOutputDTO, AxiosError<VariableCreateDTO>, VariableCreateDTO>({
    mutationFn: async (variable) => (await apiClient.variable.variableControllerCreate(variable)).data.data,
    onSuccess: async (newVariable) => {
      // update the list of variables to reflect the new variable
      await queryClient.invalidateQueries({ queryKey: variableKeys.list() });

      // Create cache key for the new variable
      queryClient.setQueryData(variableKeys.detail(newVariable.id), newVariable);
    },
  });
};

interface VariableUpdate {
  variableId: string;
  variableDetails: VariableUpdateDTO;
}

export const useVariableUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<VariableOutputDTO, AxiosError<VariableOutputDTO>, VariableUpdate>({
    mutationFn: async ({ variableId, variableDetails }) =>
      (await apiClient.variable.variableControllerUpdate(variableId, variableDetails)).data.data,
    onSuccess: async (updatedVar) => {
      // renew the list of variables to reflect the new variable
      await queryClient.invalidateQueries({ queryKey: variableKeys.list() });

      // update cache of updated variable
      queryClient.setQueryData(variableKeys.detail(updatedVar.id), updatedVar);
    },
  });
};

export const useVariableDelete = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<IdUuidDTO, AxiosError<VariableOutputDTO>, string>({
    mutationFn: async (variableId) => (await apiClient.variable.variableControllerDelete(variableId)).data.data,
    onSuccess: async (removedVar) => {
      // update the list of variables to reflect the new variable
      await queryClient.invalidateQueries({ queryKey: variableKeys.list() });

      // Delete cache for the deleted variable
      queryClient.removeQueries({ queryKey: variableKeys.detail(removedVar.id) });
    },
  });
};
