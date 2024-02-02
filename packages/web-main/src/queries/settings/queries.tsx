import { APIOutput, SettingsOutputDTO, SettingsOutputDTOAPI, SettingsOutputDTOKeyEnum } from '@takaro/apiclient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from 'hooks/useApiClient';
import { AxiosError } from 'axios';

export const settingKeys = {
  all: ['settings'] as const,
  list: () => [...settingKeys.all, 'list'] as const,
  listGameServer: (gameServerId: string) => [...settingKeys.list(), gameServerId] as const,
  globalDetail: (key: string) => [...settingKeys.all, 'detail', key] as const,
  detail: (key: string, gameServerId: string) => [...settingKeys.all, 'detail', key, gameServerId] as const,
};

export const useGlobalGameServerSettings = (keys?: SettingsOutputDTOKeyEnum[]) => {
  const apiClient = useApiClient();

  return useQuery<SettingsOutputDTO[], AxiosError<SettingsOutputDTOAPI>>({
    queryKey: settingKeys.list(),
    queryFn: async () => (await apiClient.settings.settingsControllerGet(keys, undefined)).data.data,
  });
};

export const useGameServerSettings = (gameServerId: string, keys?: SettingsOutputDTOKeyEnum[]) => {
  const apiClient = useApiClient();

  return useQuery<SettingsOutputDTO[], AxiosError<SettingsOutputDTOAPI>>({
    queryKey: settingKeys.listGameServer(gameServerId),
    queryFn: async () => (await apiClient.settings.settingsControllerGet(keys, gameServerId)).data.data,
  });
};

export const useGlobalGameServerSetting = (key: SettingsOutputDTOKeyEnum) => {
  const apiClient = useApiClient();
  return useQuery<SettingsOutputDTO, AxiosError<SettingsOutputDTOAPI>>({
    queryKey: settingKeys.globalDetail(key),
    queryFn: async () => (await apiClient.settings.settingsControllerGetOne(key, undefined)).data.data,
  });
};

export const useGameServerSetting = (key: SettingsOutputDTOKeyEnum, gameServerId: string) => {
  const apiClient = useApiClient();
  return useQuery<SettingsOutputDTO, AxiosError<SettingsOutputDTOAPI>>({
    queryKey: settingKeys.detail(key, gameServerId),
    queryFn: async () => (await apiClient.settings.settingsControllerGetOne(key, gameServerId)).data.data,
  });
};

interface GameServerDeleteSettingInput {
  key: string;
  gameServerId: string;
}
export const useDeleteGameServerSetting = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  let deletedSettingKey: string | undefined;
  let deletedGameServerId: string | undefined;

  return useMutation<APIOutput, AxiosError<APIOutput>, GameServerDeleteSettingInput>({
    mutationFn: async ({ key, gameServerId }) => {
      deletedGameServerId = gameServerId;
      return (await apiClient.settings.settingsControllerDelete(key, gameServerId)).data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: settingKeys.detail(deletedSettingKey!, deletedGameServerId!) });
    },
  });
};

interface SetGlobalSettingInput {
  key: string;
  value: string;
}

export const useSetGlobalSetting = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<APIOutput, AxiosError<APIOutput>, SetGlobalSettingInput>({
    mutationFn: async ({ key, value }) => {
      return (await apiClient.settings.settingsControllerSet(key, { value: value })).data;
    },
    onSuccess: async () => {
      // we need to invalidate the specific global setting and the entire list
      // also all gameserver settings because these might be affected by the global setting change
      queryClient.invalidateQueries({ queryKey: settingKeys.all });
    },
  });
};

interface SetGameServerSettingInput {
  key: string;
  gameServerId: string;
  value: string;
}

export const useSetGameServerSetting = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  let updatedGameServerId: string | undefined;
  let updatedSettingKey: string | undefined;

  return useMutation<APIOutput, AxiosError<APIOutput>, SetGameServerSettingInput>({
    mutationFn: async ({ key, gameServerId, value }) => {
      updatedGameServerId = gameServerId;
      updatedSettingKey = key;

      return (await apiClient.settings.settingsControllerSet(key, { gameServerId: gameServerId, value: value })).data;
    },
    onSuccess: async () => {
      // invalidate the gameserver settings list and the specific setting key of the gameserver
      queryClient.invalidateQueries({ queryKey: settingKeys.listGameServer(updatedGameServerId!) });
      queryClient.invalidateQueries({ queryKey: settingKeys.detail(updatedSettingKey!, updatedGameServerId!) });
    },
  });
};
