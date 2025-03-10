import {
  useMutation,
  useQueryClient,
  queryOptions,
  infiniteQueryOptions,
  keepPreviousData,
} from '@tanstack/react-query';
import { getApiClient } from '../util/getApiClient';
import {
  APIOutput,
  VariableCreateDTO,
  VariableOutputArrayDTOAPI,
  VariableOutputDTO,
  VariableSearchInputDTO,
  VariableUpdateDTO,
} from '@takaro/apiclient';
import { getNextPage, mutationWrapper, queryParamsToArray } from './util';
import { AxiosError } from 'axios';
import { ErrorMessageMapping } from '@takaro/lib-components/src/errors';
import { useSnackbar } from 'notistack';

export const variableKeys = {
  all: ['variables'] as const,
  list: () => [...variableKeys.all, 'list'] as const,
  detail: (id: string) => [...variableKeys.all, 'detail', id] as const,
  count: () => [...variableKeys.all, 'count'] as const,
};

const defaultVariableErrorMessages: Partial<ErrorMessageMapping> = {
  UniqueConstraintError: 'Variable with this key already exists',
};

export const variableQueryOptions = (variableId: string) =>
  queryOptions<VariableOutputDTO, AxiosError<VariableOutputDTO>>({
    queryKey: variableKeys.detail(variableId),
    queryFn: async () => {
      const resp = (await getApiClient().variable.variableControllerFindOne(variableId)).data.data;
      return resp;
    },
  });

export const variablesQueryOptions = (queryParams: VariableSearchInputDTO) =>
  queryOptions<VariableOutputArrayDTOAPI, AxiosError<VariableOutputArrayDTOAPI>>({
    queryKey: [...variableKeys.list(), queryParams],
    queryFn: async () => (await getApiClient().variable.variableControllerSearch(queryParams)).data,
  });

export const variableCountQueryOptions = () =>
  queryOptions<number, AxiosError<number>>({
    queryKey: variableKeys.count(),
    queryFn: async () => (await getApiClient().variable.variableControllerSearch({ limit: 1 })).data.meta.total!,
  });

export const variablesInfiniteQueryOptions = (queryParams: VariableSearchInputDTO) =>
  infiniteQueryOptions<VariableOutputArrayDTOAPI, AxiosError<VariableOutputArrayDTOAPI>>({
    queryKey: [...variableKeys.list(), 'infinite', ...queryParamsToArray(queryParams)],
    queryFn: async ({ pageParam }) =>
      (await getApiClient().variable.variableControllerSearch({ ...queryParams, page: pageParam as number })).data,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => getNextPage(lastPage.meta),
    placeholderData: keepPreviousData,
  });

export const useVariableCreate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<VariableOutputDTO, VariableCreateDTO>(
    useMutation<VariableOutputDTO, AxiosError<VariableCreateDTO>, VariableCreateDTO>({
      mutationFn: async (variable) => (await apiClient.variable.variableControllerCreate(variable)).data.data,
      onSuccess: async (newVariable) => {
        enqueueSnackbar('Variable created!', { variant: 'default', type: 'success' });
        await queryClient.invalidateQueries({ queryKey: variableKeys.list() });
        queryClient.setQueryData<VariableOutputDTO>(variableKeys.detail(newVariable.id), newVariable);
        queryClient.setQueryData<number>(variableKeys.count(), (old) => (old ? old + 1 : 1));
      },
    }),
    defaultVariableErrorMessages,
  );
};

interface VariableUpdate {
  variableId: string;
  variableDetails: VariableUpdateDTO;
}

export const useVariableUpdate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<VariableOutputDTO, VariableUpdate>(
    useMutation<VariableOutputDTO, AxiosError<VariableOutputDTO>, VariableUpdate>({
      mutationFn: async ({ variableId, variableDetails }) =>
        (await apiClient.variable.variableControllerUpdate(variableId, variableDetails)).data.data,
      onSuccess: async (updatedVar) => {
        enqueueSnackbar('Variable updated!', { variant: 'default', type: 'success' });
        await queryClient.invalidateQueries({ queryKey: variableKeys.list() });
        queryClient.setQueryData<VariableOutputDTO>(variableKeys.detail(updatedVar.id), updatedVar);
      },
    }),
    defaultVariableErrorMessages,
  );
};

interface VariableDeleteInput {
  variableId: string;
}

export const useVariableDelete = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<APIOutput, VariableDeleteInput>(
    useMutation<APIOutput, AxiosError<VariableOutputDTO>, VariableDeleteInput>({
      mutationFn: async ({ variableId }) => (await apiClient.variable.variableControllerDelete(variableId)).data,
      onSuccess: async (_, { variableId }) => {
        enqueueSnackbar('Variable successfully deleted!', { variant: 'default', type: 'success' });
        await queryClient.invalidateQueries({ queryKey: variableKeys.list() });
        queryClient.removeQueries({ queryKey: variableKeys.detail(variableId) });

        // if there is a count query, update the count
        const variableCountQueryData = queryClient.getQueryData<number>(variableKeys.count());
        if (variableCountQueryData) {
          queryClient.setQueryData<number>(variableKeys.count(), variableCountQueryData - 1);
        }
      },
    }),
    {},
  );
};
