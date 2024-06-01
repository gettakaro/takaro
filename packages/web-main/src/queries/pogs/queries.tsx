import { useMutation, useQueryClient, queryOptions } from '@tanstack/react-query';
import { getApiClient } from 'util/getApiClient';
import {
  PlayerOnGameServerSearchInputDTO,
  PlayerOnGameserverOutputArrayDTOAPI,
  PlayerOnGameserverOutputDTO,
  PlayerOnGameServerSetCurrencyInputDTO,
} from '@takaro/apiclient';
import { AxiosError } from 'axios';
import { mutationWrapper } from 'queries/util';

export const pogKeys = {
  all: ['pogs'] as const,
  list: () => [...pogKeys.all, 'list'] as const,
  detail: (playerId: string, gameServerId: string) => [...pogKeys.all, 'detail', playerId, gameServerId] as const,
};

interface PogInput {
  playerId: string;
  gameServerId: string;
}

export const playerOnGameServersQueryOptions = (queryParams: PlayerOnGameServerSearchInputDTO = {}) => {
  return queryOptions<PlayerOnGameserverOutputArrayDTOAPI, AxiosError<PlayerOnGameserverOutputArrayDTOAPI>>({
    queryKey: [...pogKeys.list(), { queryParams }],
    queryFn: async () => (await getApiClient().playerOnGameserver.playerOnGameServerControllerSearch(queryParams)).data,
  });
};

type CurrencyInput = PlayerOnGameServerSetCurrencyInputDTO & PogInput;
export const useSetCurrency = () => {
  const queryClient = useQueryClient();

  return mutationWrapper<PlayerOnGameserverOutputDTO, CurrencyInput>(
    useMutation<PlayerOnGameserverOutputDTO, AxiosError<PlayerOnGameserverOutputDTO>, CurrencyInput>({
      mutationFn: async ({ currency, gameServerId, playerId }) =>
        (
          await getApiClient().playerOnGameserver.playerOnGameServerControllerSetCurrency(gameServerId, playerId, {
            currency: currency,
          })
        ).data.data,
      onSuccess: (updatedPog) => {
        queryClient.invalidateQueries({ queryKey: pogKeys.list() });
        queryClient.setQueryData(pogKeys.detail(updatedPog.playerId, updatedPog.gameServerId), updatedPog);
      },
    }),
    {}
  );
};

export const useAddCurrency = () => {
  const queryClient = useQueryClient();

  return mutationWrapper<PlayerOnGameserverOutputDTO, CurrencyInput>(
    useMutation<PlayerOnGameserverOutputDTO, AxiosError<PlayerOnGameserverOutputDTO>, CurrencyInput>({
      mutationFn: async ({ currency, gameServerId, playerId }) =>
        (
          await getApiClient().playerOnGameserver.playerOnGameServerControllerAddCurrency(gameServerId, playerId, {
            currency: currency,
          })
        ).data.data,
      onSuccess: (updatedPog) => {
        queryClient.invalidateQueries({ queryKey: pogKeys.list() });
        queryClient.setQueryData(pogKeys.detail(updatedPog.playerId, updatedPog.gameServerId), updatedPog);
      },
    }),
    {}
  );
};

export const useDeductCurrency = () => {
  const queryClient = useQueryClient();

  return mutationWrapper<PlayerOnGameserverOutputDTO, CurrencyInput>(
    useMutation<PlayerOnGameserverOutputDTO, AxiosError<PlayerOnGameserverOutputDTO>, CurrencyInput>({
      mutationFn: async ({ currency, gameServerId, playerId }) =>
        (
          await getApiClient().playerOnGameserver.playerOnGameServerControllerDeductCurrency(gameServerId, playerId, {
            currency: currency,
          })
        ).data.data,
      onSuccess: (updatedPog) => {
        queryClient.invalidateQueries({ queryKey: pogKeys.list() });
        queryClient.setQueryData(pogKeys.detail(updatedPog.playerId, updatedPog.gameServerId), updatedPog);
      },
    }),
    {}
  );
};

interface TransactBetweenPlayersInput extends PlayerOnGameServerSetCurrencyInputDTO {
  gameServerId: string;
  senderId: string;
  receiverId: string;
}

export const useTransactBetweenPlayers = () => {
  const queryClient = useQueryClient();

  return mutationWrapper<unknown, TransactBetweenPlayersInput>(
    useMutation<unknown, AxiosError<PlayerOnGameserverOutputDTO>, TransactBetweenPlayersInput>({
      mutationFn: async ({ gameServerId, senderId, receiverId, currency }) =>
        (
          await getApiClient().playerOnGameserver.playerOnGameServerControllerTransactBetweenPlayers(
            gameServerId,
            senderId,
            receiverId,
            { currency }
          )
        ).data.data,
      onSuccess: () => {
        // TODO: instead of invalidating all, should invalidate only the list, sender and receiver.
        queryClient.invalidateQueries({ queryKey: pogKeys.all });
      },
    }),
    {}
  );
};
