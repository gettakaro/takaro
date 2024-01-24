import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from 'hooks/useApiClient';
import {
  PlayerOnGameServerSearchInputDTO,
  PlayerOnGameserverOutputArrayDTOAPI,
  PlayerOnGameserverOutputDTO,
  PlayerOnGameServerSetCurrencyInputDTO,
  PlayerOnGameServerStatsInputDTO,
} from '@takaro/apiclient';
import { AxiosError } from 'axios';

export const pogKeys = {
  all: ['pogs'] as const,
  list: () => [...pogKeys.all, 'list'] as const,
  detail: (playerId: string, gameServerId: string) => [...pogKeys.all, 'detail', playerId, gameServerId] as const,
};

interface PogInput {
  playerId: string;
  gameServerId: string;
}

export const usePlayerOnGameServers = (queryParams: PlayerOnGameServerSearchInputDTO = {}) => {
  const apiClient = useApiClient();

  const queryOpts = useQuery<PlayerOnGameserverOutputArrayDTOAPI, AxiosError<PlayerOnGameserverOutputArrayDTOAPI>>({
    queryKey: [...pogKeys.list(), { queryParams }],
    queryFn: async () => (await apiClient.playerOnGameserver.playerOnGameServerControllerSearch(queryParams)).data,
    keepPreviousData: true,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
  return queryOpts;
};

type PingStatInput = PlayerOnGameServerStatsInputDTO & PogInput;

export const usePingStat = ({ gameServerId, playerId, startISO, endISO }: PingStatInput) => {
  const apiClient = useApiClient();

  return useQuery<any, AxiosError<any>>({
    queryKey: [...pogKeys.detail(playerId, gameServerId), startISO, endISO],
    queryFn: async () =>
      (
        await apiClient.playerOnGameserver.playerOnGameServerControllerPing(gameServerId, playerId, {
          startISO,
          endISO,
        })
      ).data,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

type CurrencyInput = PlayerOnGameServerSetCurrencyInputDTO & PogInput;
export const useSetCurrency = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<PlayerOnGameserverOutputDTO, AxiosError<PlayerOnGameserverOutputDTO>, CurrencyInput>({
    mutationFn: async ({ currency, gameServerId, playerId }) =>
      (
        await apiClient.playerOnGameserver.playerOnGameServerControllerSetCurrency(gameServerId, playerId, {
          currency: currency,
        })
      ).data.data,
    onSuccess: (updatedPog) => {
      queryClient.invalidateQueries(pogKeys.list());
      queryClient.setQueryData(pogKeys.detail(updatedPog.playerId, updatedPog.gameServerId), updatedPog);
    },
  });
};

export const useAddCurrency = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<PlayerOnGameserverOutputDTO, AxiosError<PlayerOnGameserverOutputDTO>, CurrencyInput>({
    mutationFn: async ({ currency, gameServerId, playerId }) =>
      (
        await apiClient.playerOnGameserver.playerOnGameServerControllerAddCurrency(gameServerId, playerId, {
          currency: currency,
        })
      ).data.data,
    onSuccess: (updatedPog) => {
      queryClient.invalidateQueries(pogKeys.list());
      queryClient.setQueryData(pogKeys.detail(updatedPog.playerId, updatedPog.gameServerId), updatedPog);
    },
  });
};

export const useDeductCurrency = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<PlayerOnGameserverOutputDTO, AxiosError<PlayerOnGameserverOutputDTO>, CurrencyInput>({
    mutationFn: async ({ currency, gameServerId, playerId }) =>
      (
        await apiClient.playerOnGameserver.playerOnGameServerControllerDeductCurrency(gameServerId, playerId, {
          currency: currency,
        })
      ).data.data,
    onSuccess: (updatedPog) => {
      queryClient.invalidateQueries(pogKeys.list());
      queryClient.setQueryData(pogKeys.detail(updatedPog.playerId, updatedPog.gameServerId), updatedPog);
    },
  });
};

interface TransactBetweenPlayersInput extends PlayerOnGameServerSetCurrencyInputDTO {
  gameServerId: string;
  senderId: string;
  receiverId: string;
}

export const useTransactBetweenPlayers = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError<PlayerOnGameserverOutputDTO>, TransactBetweenPlayersInput>({
    mutationFn: async ({ gameServerId, senderId, receiverId, currency }) =>
      (
        await apiClient.playerOnGameserver.playerOnGameServerControllerTransactBetweenPlayers(
          gameServerId,
          senderId,
          receiverId,
          { currency }
        )
      ).data.data,
    onSuccess: () => {
      // TODO: instead of invalidating all, should invalidate only the list, sender and receiver.
      queryClient.invalidateQueries(pogKeys.all);
    },
  });
};
