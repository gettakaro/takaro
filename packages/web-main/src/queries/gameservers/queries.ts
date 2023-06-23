import {
  GameServerCreateDTO,
  GameServerOutputDTO,
  GameServerTestReachabilityDTOAPI,
  GameServerTestReachabilityInputDTOTypeEnum,
  GameServerUpdateDTO,
  IdUuidDTO,
  ModuleInstallationOutputDTO,
  ModuleInstallDTO,
  SettingsOutputObjectDTOAPI,
} from '@takaro/apiclient';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useApiClient } from 'hooks/useApiClient';
import { useSnackbar } from 'notistack';

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

  return useQuery<GameServerOutputDTO>({
    queryKey: gameServerKeys.detail(id),
    queryFn: async () => {
      const resp = (await apiClient.gameserver.gameServerControllerGetOne(id))
        .data.data;
      return resp;
    },
    enabled: Boolean(id),
  });
};

export const useGameServerCreate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (gameServer: GameServerCreateDTO) =>
      (await apiClient.gameserver.gameServerControllerCreate(gameServer)).data,
    onSuccess: async (data) => {
      // Add item to cached list
      queryClient.setQueryData<GameServerOutputDTO[]>(
        gameServerKeys.list(),
        (old) => (old ? (old = [...old, data.data]) : old!)
      );

      enqueueSnackbar('Game server has been created', { variant: 'default' });
    },
  });
};

export const useGameServerSendMessage = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async ({ gameServerId }: { gameServerId: string }) =>
      (await apiClient.gameserver.gameServerControllerSendMessage(gameServerId))
        .data,
  });
};

// INSTALLED MODULES
export const useGameServerModuleInstallations = (gameServerId: string) => {
  const apiClient = useApiClient();
  return useQuery<ModuleInstallationOutputDTO[]>({
    queryKey: installedModuleKeys.list(gameServerId),
    queryFn: async () =>
      (
        await apiClient.gameserver.gameServerControllerGetInstalledModules(
          gameServerId
        )
      ).data.data,
  });
};

export const useGameServerModuleInstallation = (
  gameServerId: string,
  moduleId: string
) => {
  const apiClient = useApiClient();

  return useQuery<ModuleInstallationOutputDTO>({
    queryKey: installedModuleKeys.detail(gameServerId, moduleId),
    queryFn: async () =>
      (
        await apiClient.gameserver.gameServerControllerGetModuleInstallation(
          gameServerId,
          moduleId
        )
      ).data.data,
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

  return useMutation({
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
  });
};

export const useGameServerModuleUninstall = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameServerId,
      moduleId,
    }: {
      gameServerId: string;
      moduleId: string;
    }) =>
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
  });
};

// SERVER SETTINGS
export const useGameServerSettings = (id?: string) => {
  const apiClient = useApiClient();

  return useQuery<SettingsOutputObjectDTOAPI['data']>({
    queryKey: gameServerKeys.settings(id),
    queryFn: async () =>
      (await apiClient.settings.settingsControllerGet(undefined, id)).data.data,
  });
};

interface GameServerUpdate {
  gameServerId: string;
  gameServerDetails: GameServerUpdateDTO;
}

export const useGameServerUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameServerId,
      gameServerDetails,
    }: GameServerUpdate) => {
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
  });
};

export const useRemoveGameServer = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) =>
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
  });
};

export const useGameServerReachabilityById = (id: string) => {
  const apiClient = useApiClient();

  return useQuery<GameServerTestReachabilityDTOAPI>(
    gameServerKeys.reachability(id),
    async () =>
      (await apiClient.gameserver.gameServerControllerTestReachabilityForId(id))
        .data
  );
};

export const useGameServerReachabilityByConfig = () => {
  const apiClient = useApiClient();
  return useMutation({
    mutationFn: async ({
      type,
      connectionInfo,
    }: {
      type: GameServerTestReachabilityInputDTOTypeEnum;
      connectionInfo: string;
    }) => {
      return await apiClient.gameserver.gameServerControllerTestReachability({
        type,
        connectionInfo,
      });
    },
  });
};
