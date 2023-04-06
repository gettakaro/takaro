import {
  APIOutput,
  GameServerCreateDTO,
  GameServerOutputDTO,
  GameServerTestReachabilityDTOAPI,
  GameServerUpdateDTO,
  ModuleInstallDTO,
  ModuleOutputDTO,
  SettingsOutputObjectDTOAPI,
} from '@takaro/apiclient';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useApiClient } from 'hooks/useApiClient';
import { useSnackbar } from 'notistack';

export const gameServerKeys = {
  all: ['gameservers'] as const,
  list: () => [...gameServerKeys.all, 'list'] as const,
  detail: (id: string) => [...gameServerKeys.all, 'detail', id] as const,

  settings: (id: string) => [...gameServerKeys.all, 'settings', id] as const,
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
    onSuccess: () => {
      // TODO: Does this make any of the gameserver data dirty?
    },
  });
};

// INSTALLED MODULES
export const useGameServerModuleInstallations = (gameServerId: string) => {
  const apiClient = useApiClient();
  return useQuery<ModuleOutputDTO[]>({
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

  return useQuery<ModuleInstallDTO>({
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
    onSuccess: async (moduleInstallation: ModuleInstallDTO) => {
      // TODO: replace game-server-id and module-id with values from moduleInstallation

      // invalidate list of installed modules
      queryClient.invalidateQueries(installedModuleKeys.list('game-server-id'));

      // TODO: invalidate the getInstalledModule
      queryClient.invalidateQueries(
        installedModuleKeys.detail('game-server-id', 'module-id')
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
      ).data,
    onSuccess: async (_module: APIOutput) => {
      // TODO: moduleInstallation should be an ModuleUninstallDTO
      // TODO: replace game-server-id and module-id by values in moduleInstallation when present
      // update the list of installed modules
      queryClient.setQueryData<ModuleOutputDTO[]>(
        installedModuleKeys.list('game-server-id'),
        (old) =>
          old
            ? old.filter(
                (installedModule) => installedModule.id !== 'module-id'
              )
            : old!
      );

      // TODO: replace game-server-id with the actual gameServerId, + module-id same thing
      queryClient.invalidateQueries(
        installedModuleKeys.detail('game-server-id', 'module-id')
      );
    },
  });
};

// SERVER SETTINGS
export const useGameServerSettings = (id: string) => {
  const apiClient = useApiClient();

  return useQuery<SettingsOutputObjectDTOAPI>({
    queryKey: gameServerKeys.settings(id),
    queryFn: async () =>
      (await apiClient.settings.settingsControllerGet(undefined, id)).data,
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
      ).data;
    },
    onSuccess: async (newGameServer) => {
      // Update item in server list
      queryClient.setQueryData<GameServerOutputDTO[]>(
        gameServerKeys.list(),
        (oldGameServerList) => {
          if (oldGameServerList) {
            oldGameServerList.map((gameServer) => {
              if (gameServer.id === newGameServer.data.id) {
                return newGameServer;
              }
              return gameServer;
            });
          }
          return oldGameServerList!;
        }
      );

      // invalidate the specific gameserver query
      queryClient.invalidateQueries(
        gameServerKeys.detail(newGameServer.data.id)
      );
    },
  });
};

// TODO: id should be passed to the mutation function.
// But that would require that the result of the mutation returns the id
// so it can be used in the onSuccess method. Currently that is not the case so for now it is passed to the hook itself.
export const useRemoveGameServer = (id: string) => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      await apiClient.gameserver.gameServerControllerRemove(id),
    onSuccess: () => {
      // update list that contain this gameserver
      queryClient.setQueryData<GameServerOutputDTO[]>(
        gameServerKeys.list(),
        (old) => (old ? old.filter((gameServer) => gameServer.id !== id) : old!)
      );

      // remove all cached information about specific game server.
      queryClient.invalidateQueries({ queryKey: gameServerKeys.detail(id) });
      queryClient.invalidateQueries({
        queryKey: gameServerKeys.reachability(id),
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
