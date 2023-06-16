import {
  APIOutput,
  GameServerCreateDTO,
  GameServerOutputDTO,
  GameServerTestReachabilityInputDTOTypeEnum,
  GameServerUpdateDTO,
  IdUuidDTO,
  ModuleInstallationOutputDTO,
  ModuleInstallDTO,
  SettingsOutputObjectDTOAPI,
  TestReachabilityOutput,
} from '@takaro/apiclient';

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useApiClient } from 'hooks/useApiClient';
import { useSnackbar } from 'notistack';
import { TakaroError } from '../errorType';

export const gameServerKeys = {
  all: ['gameservers'] as const,
  list: () => [...gameServerKeys.all, 'list'] as const,
  detail: (id: string) => [...gameServerKeys.all, 'detail', id] as const,

  settings: (id?: string) => [...gameServerKeys.all, 'settings', id] as const,
  reachability: (id: string) =>
    [...gameServerKeys.all, 'reachable', id] as const,
};

export const installedModuleKeys = {
  all: ['installed modules'] as const,
  list: (gameServerId: string) =>
    [...installedModuleKeys.all, 'list', gameServerId] as const,
  detail: (gameServerId: string, moduleId: string) =>
    [...installedModuleKeys.all, 'detail', gameServerId, moduleId] as const,
};

export const useGameServers = () => {
  const apiClient = useApiClient();

  return useQuery<GameServerOutputDTO[]>({
    queryKey: gameServerKeys.list(),
    queryFn: async () =>
      (await apiClient.gameserver.gameServerControllerSearch()).data.data,
  });
};

export const useGameServer = (id: string) => {
  const apiClient = useApiClient();

  return useQuery<GameServerOutputDTO, TakaroError>({
    queryKey: gameServerKeys.detail(id),
    queryFn: async () => {
      const resp = await apiClient.gameserver.gameServerControllerGetOne(id);
      return resp.data.data;
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
    enabled: Boolean(id),
  });
};

export const useGameServerCreate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation<GameServerOutputDTO, TakaroError, GameServerCreateDTO>({
    mutationFn: async (gameServer: GameServerCreateDTO) =>
      (await apiClient.gameserver.gameServerControllerCreate(gameServer)).data
        .data,
    onSuccess: async (data) => {
      // Add item to cached list
      queryClient.setQueryData<GameServerOutputDTO[]>(
        gameServerKeys.list(),
        (old) => (old ? (old = [...old, data]) : old!)
      );
      enqueueSnackbar('Game server has been created', { variant: 'default' });
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

export const useGameServerSendMessage = () => {
  const apiClient = useApiClient();

  return useMutation<APIOutput, TakaroError, { gameServerId: string }>({
    mutationFn: async ({ gameServerId }) =>
      (await apiClient.gameserver.gameServerControllerSendMessage(gameServerId))
        .data,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

// INSTALLED MODULES
export const useGameServerModuleInstallations = (gameServerId: string) => {
  const apiClient = useApiClient();
  return useQuery<ModuleInstallationOutputDTO[], TakaroError>({
    queryKey: installedModuleKeys.list(gameServerId),
    queryFn: async () =>
      (
        await apiClient.gameserver.gameServerControllerGetInstalledModules(
          gameServerId
        )
      ).data.data,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

export const useGameServerModuleInstallation = (
  gameServerId: string,
  moduleId: string
) => {
  const apiClient = useApiClient();

  return useQuery<ModuleInstallationOutputDTO, TakaroError>({
    queryKey: installedModuleKeys.detail(gameServerId, moduleId),
    queryFn: async () =>
      (
        await apiClient.gameserver.gameServerControllerGetModuleInstallation(
          gameServerId,
          moduleId
        )
      ).data.data,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

interface GameServerModuleInstall {
  gameServerId: string;
  moduleId: string;
  moduleInstall: ModuleInstallDTO;
}

export const useGameServerModuleInstall = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<
    ModuleInstallationOutputDTO,
    TakaroError,
    GameServerModuleInstall
  >({
    mutationFn: async ({
      gameServerId,
      moduleId,
      moduleInstall,
    }: GameServerModuleInstall) =>
      (
        await apiClient.gameserver.gameServerControllerInstallModule(
          gameServerId,
          moduleId,
          moduleInstall
        )
      ).data.data,
    onSuccess: async (moduleInstallation: ModuleInstallationOutputDTO) => {
      // invalidate list of installed modules
      queryClient.invalidateQueries(
        installedModuleKeys.list(moduleInstallation.gameserverId)
      );

      queryClient.invalidateQueries(
        installedModuleKeys.detail(
          moduleInstallation.gameserverId,
          moduleInstallation.moduleId
        )
      );
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

interface GameServerModuleUninstall {
  gameServerId: string;
  moduleId: string;
}

export const useGameServerModuleUninstall = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<
    ModuleInstallationOutputDTO,
    TakaroError,
    GameServerModuleUninstall
  >({
    mutationFn: async ({ gameServerId, moduleId }) =>
      (
        await apiClient.gameserver.gameServerControllerUninstallModule(
          gameServerId,
          moduleId
        )
      ).data.data,
    onSuccess: async (deletedModule: ModuleInstallationOutputDTO) => {
      // update the list of installed modules
      queryClient.setQueryData<ModuleInstallationOutputDTO[]>(
        installedModuleKeys.list(deletedModule.gameserverId),
        (old) => {
          return old
            ? old.filter((installedModule) => {
                return installedModule.moduleId !== deletedModule.moduleId;
              })
            : old!;
        }
      );

      queryClient.invalidateQueries(
        installedModuleKeys.detail(
          deletedModule.gameserverId,
          deletedModule.moduleId
        )
      );
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

// SERVER SETTINGS
export const useGameServerSettings = (id?: string) => {
  const apiClient = useApiClient();

  return useQuery<SettingsOutputObjectDTOAPI['data'], TakaroError>({
    queryKey: gameServerKeys.settings(id),
    queryFn: async () =>
      (await apiClient.settings.settingsControllerGet(undefined, id)).data.data,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

interface GameServerUpdate {
  gameServerId: string;
  gameServerDetails: GameServerUpdateDTO;
}

export const useGameServerUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<GameServerOutputDTO, TakaroError, GameServerUpdate>({
    mutationFn: async ({ gameServerId, gameServerDetails }) => {
      return (
        await apiClient.gameserver.gameServerControllerUpdate(
          gameServerId,
          gameServerDetails
        )
      ).data.data;
    },
    onSuccess: async (newGameServer) => {
      // Update item in server list
      queryClient.setQueryData<GameServerOutputDTO[]>(
        gameServerKeys.list(),
        (oldGameServerList) => {
          if (oldGameServerList) {
            return oldGameServerList.map((gameServer) => {
              if (gameServer.id === newGameServer.id) {
                return newGameServer;
              }
              return gameServer;
            });
          }
          return oldGameServerList!;
        }
      );
      // invalidate the specific gameserver query
      queryClient.invalidateQueries(gameServerKeys.detail(newGameServer.id));
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

export const useRemoveGameServer = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<IdUuidDTO, TakaroError, { id: string }>({
    mutationFn: async ({ id }) =>
      (await apiClient.gameserver.gameServerControllerRemove(id)).data.data,
    onSuccess: (removedGameServer: IdUuidDTO) => {
      // update list that contain this gameserver
      queryClient.setQueryData<GameServerOutputDTO[]>(
        gameServerKeys.list(),
        (old) =>
          old
            ? old.filter((gameServer) => gameServer.id !== removedGameServer.id)
            : old!
      );

      // remove all cached information about specific game server.
      queryClient.invalidateQueries({
        queryKey: gameServerKeys.detail(removedGameServer.id),
      });
      queryClient.invalidateQueries({
        queryKey: gameServerKeys.reachability(removedGameServer.id),
      });
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

export const useGameServerReachabilityById = (id: string) => {
  const apiClient = useApiClient();

  return useQuery<TestReachabilityOutput, TakaroError>({
    queryKey: gameServerKeys.reachability(id),
    queryFn: async () =>
      (await apiClient.gameserver.gameServerControllerTestReachabilityForId(id))
        .data.data,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

type GameServerTestReachabilityConfig = {
  type: GameServerTestReachabilityInputDTOTypeEnum;
  connectionInfo: string;
};

export const useGameServerReachabilityByConfig = () => {
  const apiClient = useApiClient();
  return useMutation<
    TestReachabilityOutput,
    TakaroError,
    GameServerTestReachabilityConfig
  >({
    mutationFn: async ({ type, connectionInfo }) => {
      return (
        await apiClient.gameserver.gameServerControllerTestReachability({
          type,
          connectionInfo,
        })
      ).data.data;
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};
