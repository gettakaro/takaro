import { useMutation, useQueryClient, queryOptions } from '@tanstack/react-query';
import { getApiClient } from '../util/getApiClient';
import {
  PlayerOnGameServerSearchInputDTO,
  PlayerOnGameserverOutputArrayDTOAPI,
  PlayerOnGameserverOutputDTO,
  PlayerOnGameServerSetCurrencyInputDTO,
  APIOutput,
  GiveItemInputDTO,
} from '@takaro/apiclient';
import { AxiosError } from 'axios';
import { mutationWrapper, queryParamsToArray } from '../queries/util';
import { useSnackbar } from 'notistack';
import { userKeys } from './user';

export const pogKeys = {
  all: ['pogs'] as const,
  list: () => [...pogKeys.all, 'list'] as const,
  detail: (playerId: string, gameServerId: string) => [...pogKeys.all, 'detail', playerId, gameServerId] as const,
};

interface PogInput {
  playerId: string;
  gameServerId: string;
}

export const playersOnGameServersQueryOptions = (queryParams: PlayerOnGameServerSearchInputDTO = {}) => {
  return queryOptions<PlayerOnGameserverOutputArrayDTOAPI, AxiosError<PlayerOnGameserverOutputArrayDTOAPI>>({
    queryKey: [...pogKeys.list(), ...queryParamsToArray(queryParams)],
    queryFn: async () => (await getApiClient().playerOnGameserver.playerOnGameServerControllerSearch(queryParams)).data,
  });
};

export const playerOnGameServerQueryOptions = (gameServerId: string, playerId: string) => {
  return queryOptions<PlayerOnGameserverOutputDTO, AxiosError<PlayerOnGameserverOutputDTO>>({
    queryKey: pogKeys.detail(playerId, gameServerId),
    queryFn: async () =>
      (await getApiClient().playerOnGameserver.playerOnGameServerControllerGetOne(gameServerId, playerId)).data.data,
  });
};

type CurrencyInput = PlayerOnGameServerSetCurrencyInputDTO & PogInput;
export const useSetCurrency = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<PlayerOnGameserverOutputDTO, CurrencyInput>(
    useMutation<PlayerOnGameserverOutputDTO, AxiosError<PlayerOnGameserverOutputDTO>, CurrencyInput>({
      mutationFn: async ({ currency, gameServerId, playerId }) =>
        (
          await getApiClient().playerOnGameserver.playerOnGameServerControllerSetCurrency(gameServerId, playerId, {
            currency: currency,
          })
        ).data.data,
      onSuccess: (updatedPog) => {
        enqueueSnackbar('Currency set!', { variant: 'default', type: 'success' });
        queryClient.invalidateQueries({ queryKey: userKeys.me() });
        queryClient.invalidateQueries({ queryKey: pogKeys.list() });
        queryClient.setQueryData(pogKeys.detail(updatedPog.playerId, updatedPog.gameServerId), updatedPog);
      },
    }),
    {},
  );
};

export const useAddCurrency = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<PlayerOnGameserverOutputDTO, CurrencyInput>(
    useMutation<PlayerOnGameserverOutputDTO, AxiosError<PlayerOnGameserverOutputDTO>, CurrencyInput>({
      mutationFn: async ({ currency, gameServerId, playerId }) =>
        (
          await getApiClient().playerOnGameserver.playerOnGameServerControllerAddCurrency(gameServerId, playerId, {
            currency: currency,
          })
        ).data.data,
      onSuccess: (updatedPog) => {
        enqueueSnackbar('Currency added!', { variant: 'default', type: 'success' });
        queryClient.invalidateQueries({ queryKey: pogKeys.list() });
        queryClient.invalidateQueries({ queryKey: userKeys.me() });
        queryClient.setQueryData(pogKeys.detail(updatedPog.playerId, updatedPog.gameServerId), updatedPog);
      },
    }),
    {},
  );
};

export const useDeductCurrency = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<PlayerOnGameserverOutputDTO, CurrencyInput>(
    useMutation<PlayerOnGameserverOutputDTO, AxiosError<PlayerOnGameserverOutputDTO>, CurrencyInput>({
      mutationFn: async ({ currency, gameServerId, playerId }) =>
        (
          await getApiClient().playerOnGameserver.playerOnGameServerControllerDeductCurrency(gameServerId, playerId, {
            currency: currency,
          })
        ).data.data,
      onSuccess: (updatedPog) => {
        enqueueSnackbar('Currency deducted!', { variant: 'default', type: 'success' });
        queryClient.invalidateQueries({ queryKey: userKeys.me() });
        queryClient.invalidateQueries({ queryKey: pogKeys.list() });
        queryClient.setQueryData(pogKeys.detail(updatedPog.playerId, updatedPog.gameServerId), updatedPog);
      },
    }),
    {},
  );
};

interface TransactBetweenPlayersInput extends PlayerOnGameServerSetCurrencyInputDTO {
  gameServerId: string;
  senderPlayerId: string;
  receiverPlayerId: string;
}

export const useTransactBetweenPlayers = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<unknown, TransactBetweenPlayersInput>(
    useMutation<unknown, AxiosError<PlayerOnGameserverOutputDTO>, TransactBetweenPlayersInput>({
      mutationFn: async ({ gameServerId, senderPlayerId, receiverPlayerId, currency }) =>
        (
          await getApiClient().playerOnGameserver.playerOnGameServerControllerTransactBetweenPlayers(
            gameServerId,
            senderPlayerId,
            receiverPlayerId,
            { currency },
          )
        ).data.data,
      onSuccess: async (_, { senderPlayerId, receiverPlayerId, gameServerId }) => {
        enqueueSnackbar('Transaction successfull!', { variant: 'default', type: 'success' });
        queryClient.invalidateQueries({ queryKey: userKeys.me() });
        queryClient.invalidateQueries({ queryKey: pogKeys.detail(senderPlayerId, gameServerId) });
        queryClient.invalidateQueries({ queryKey: pogKeys.detail(receiverPlayerId, gameServerId) });
        queryClient.invalidateQueries({ queryKey: pogKeys.list() });
      },
    }),
    {},
  );
};

interface GiveItemInput extends GiveItemInputDTO {
  gameServerId: string;
  playerId: string;
}

export const useGiveItem = () => {
  const queryClient = useQueryClient();

  return mutationWrapper<APIOutput, GiveItemInput>(
    useMutation<void, AxiosError<APIOutput>, GiveItemInput>({
      mutationFn: async ({ name, amount, quality, gameServerId, playerId }) =>
        (
          await getApiClient().gameserver.gameServerControllerGiveItem(gameServerId, playerId, {
            name,
            amount,
            quality,
          })
        ).data,
      onSuccess: (_, { playerId, gameServerId }) => {
        queryClient.invalidateQueries({ queryKey: pogKeys.detail(playerId, gameServerId) });
      },
    }),
    {},
  );
};
