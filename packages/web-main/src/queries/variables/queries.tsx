import { useMutation, useQueryClient, queryOptions } from '@tanstack/react-query';
import { getApiClient } from 'util/getApiClient';
import {
  IdUuidDTO,
  VariableCreateDTO,
  VariableOutputArrayDTOAPI,
  VariableOutputDTO,
  VariableSearchInputDTO,
  VariableUpdateDTO,
} from '@takaro/apiclient';
import { queryParamsToArray, mutationWrapper } from '../util';
import { AxiosError } from 'axios';
import { ErrorMessageMapping } from '@takaro/lib-components/src/errors';

export const variableKeys = {
  all: ['variables'] as const,
  list: () => [...variableKeys.all, 'list'] as const,
  detail: (id: string) => [...variableKeys.all, 'detail', id] as const,
};

const defaultVariableErrorMessages: Partial<ErrorMessageMapping> = {
  UniqueConstraintError: 'Variable with this key already exists',
};

export const variableOptions = (variableId: string) =>
  queryOptions<VariableOutputDTO, AxiosError<VariableOutputDTO>>({
    queryKey: variableKeys.detail(variableId),
    queryFn: async () => {
      const resp = (await getApiClient().variable.variableControllerFindOne(variableId)).data.data;
      return resp;
    },
  });

export const variablesOptions = (queryParams: VariableSearchInputDTO) =>
  queryOptions<VariableOutputArrayDTOAPI, AxiosError<VariableOutputArrayDTOAPI>>({
    queryKey: [...variableKeys.list(), ...queryParamsToArray(queryParams)],
    queryFn: async () => (await getApiClient().variable.variableControllerSearch(queryParams)).data,
  });

export const useVariableCreate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<VariableOutputDTO, VariableCreateDTO>(
    useMutation<VariableOutputDTO, AxiosError<VariableCreateDTO>, VariableCreateDTO>({
      mutationFn: async (variable) => (await apiClient.variable.variableControllerCreate(variable)).data.data,
      onSuccess: async (newVariable) => {
        // update the list of variables to reflect the new variable
        await queryClient.invalidateQueries({ queryKey: variableKeys.list() });

        // Create cache key for the new variable
        queryClient.setQueryData<VariableOutputDTO>(variableKeys.detail(newVariable.id), newVariable);
      },
    }),
    defaultVariableErrorMessages
  );
};

interface VariableUpdate {
  variableId: string;
  variableDetails: VariableUpdateDTO;
}

export const useVariableUpdate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<VariableOutputDTO, VariableUpdate>(
    useMutation<VariableOutputDTO, AxiosError<VariableOutputDTO>, VariableUpdate>({
      mutationFn: async ({ variableId, variableDetails }) =>
        (await apiClient.variable.variableControllerUpdate(variableId, variableDetails)).data.data,
      onSuccess: async (updatedVar) => {
        // renew the list of variables to reflect the new variable
        await queryClient.invalidateQueries({ queryKey: variableKeys.list() });

        // update cache of updated variable
        queryClient.setQueryData<VariableOutputDTO>(variableKeys.detail(updatedVar.id), updatedVar);
      },
    }),
    defaultVariableErrorMessages
  );
};

interface VariableDeleteInput {
  variableId: string;
}

export const useVariableDelete = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<IdUuidDTO, VariableDeleteInput>(
    useMutation<IdUuidDTO, AxiosError<VariableOutputDTO>, VariableDeleteInput>({
      mutationFn: async ({ variableId }) => (await apiClient.variable.variableControllerDelete(variableId)).data.data,
      onSuccess: async (removedVar) => {
        // update the list of variables to reflect the new variable
        await queryClient.invalidateQueries({ queryKey: variableKeys.list() });

        // Delete cache for the deleted variable
        queryClient.removeQueries({ queryKey: variableKeys.detail(removedVar.id) });
      },
    }),
    {}
  );
};
