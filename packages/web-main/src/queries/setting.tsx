import {
  APIOutput,
  SettingsOutputArrayDTOAPI,
  SettingsOutputDTO,
  SettingsOutputDTOAPI,
  SettingsOutputDTOKeyEnum,
} from '@takaro/apiclient';
import { useMutation, useQueryClient, queryOptions } from '@tanstack/react-query';
import { getApiClient } from 'util/getApiClient';
import { AxiosError } from 'axios';
import { mutationWrapper } from 'queries/util';

export const settingKeys = {
  all: ['settings'] as const,
  list: () => [...settingKeys.all, 'list'] as const,
  globalDetail: (key: string) => [...settingKeys.all, 'global', 'detail', key] as const,
  listGameServer: (gameServerId: string) => [...settingKeys.list(), gameServerId] as const,
  detail: (key: string, gameServerId: string) => [...settingKeys.all, 'detail', key, gameServerId] as const,
};

export const globalGameServerSettingsQueryOptions = (keys?: SettingsOutputDTOKeyEnum[]) => {
  const apiClient = getApiClient();
  return queryOptions<SettingsOutputDTO[], AxiosError<SettingsOutputDTOAPI>>({
    queryKey: settingKeys.list(),
    queryFn: async () => (await apiClient.settings.settingsControllerGet(keys, undefined)).data.data,
  });
};

export const gameServerSettingsQueryOptions = (gameServerId: string, keys?: SettingsOutputDTOKeyEnum[]) => {
  const apiClient = getApiClient();

  return queryOptions<SettingsOutputDTO[], AxiosError<SettingsOutputDTOAPI>>({
    queryKey: settingKeys.listGameServer(gameServerId),
    queryFn: async () => (await apiClient.settings.settingsControllerGet(keys, gameServerId)).data.data,
  });
};

export const globalGameServerSetingQueryOptions = (key: SettingsOutputDTOKeyEnum) => {
  const apiClient = getApiClient();
  return queryOptions<SettingsOutputDTO, AxiosError<SettingsOutputDTOAPI>>({
    queryKey: settingKeys.globalDetail(key),
    queryFn: async () => (await apiClient.settings.settingsControllerGetOne(key, undefined)).data.data,
  });
};

export const gameServerSettingQueryOptions = (key: SettingsOutputDTOKeyEnum, gameServerId: string) => {
  const apiClient = getApiClient();
  return queryOptions<SettingsOutputDTO, AxiosError<SettingsOutputDTOAPI>>({
    queryKey: settingKeys.detail(key, gameServerId),
    queryFn: async () => (await apiClient.settings.settingsControllerGetOne(key, gameServerId)).data.data,
  });
};

interface GameServerDeleteSettingInput {
  key: string;
  gameServerId: string;
}
export const useDeleteGameServerSetting = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<SettingsOutputArrayDTOAPI, GameServerDeleteSettingInput>(
    useMutation<APIOutput, AxiosError<APIOutput>, GameServerDeleteSettingInput>({
      mutationFn: async ({ key, gameServerId }) => {
        return (await apiClient.settings.settingsControllerDelete(key, gameServerId)).data;
      },
      onSuccess: async (_, { gameServerId, key }) => {
        queryClient.invalidateQueries({ queryKey: settingKeys.detail(key!, gameServerId!) });
      },
    }),
    {},
  );
};

interface SetGlobalSettingInput {
  key: string;
  value: string;
}

export const useSetGlobalSetting = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<APIOutput, SetGlobalSettingInput>(
    useMutation<APIOutput, AxiosError<APIOutput>, SetGlobalSettingInput>({
      mutationFn: async ({ key, value }) => {
        return (await apiClient.settings.settingsControllerSet(key, { value: value })).data;
      },
      onSuccess: async (_, { key }) => {
        // we need to invalidate the specific global setting and the entire list.
        // also all gameserver settings because these might be affected by the global setting change
        await queryClient.invalidateQueries({ queryKey: settingKeys.globalDetail(key) });
        await queryClient.invalidateQueries({ queryKey: settingKeys.list() });
      },
    }),
    {},
  );
};

interface SetGameServerSettingInput {
  key: string;
  gameServerId: string;
  value: string;
}

export const useSetGameServerSetting = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<APIOutput, SetGameServerSettingInput>(
    useMutation<APIOutput, AxiosError<APIOutput>, SetGameServerSettingInput>({
      mutationFn: async ({ key, gameServerId, value }) => {
        return (await apiClient.settings.settingsControllerSet(key, { gameServerId: gameServerId, value: value })).data;
      },
      onSuccess: async (_, { gameServerId, key }) => {
        // invalidate the gameserver settings list and the specific setting key of the gameserver
        queryClient.invalidateQueries({ queryKey: settingKeys.listGameServer(gameServerId!) });
        queryClient.invalidateQueries({ queryKey: settingKeys.detail(key!, gameServerId!) });
      },
    }),
    {},
  );
};
