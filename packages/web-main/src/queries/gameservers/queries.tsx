import {
  APIOutput,
  GameServerCreateDTO,
  GameServerOutputArrayDTOAPI,
  GameServerOutputDTO,
  GameServerOutputDTOAPI,
  GameServerSearchInputDTO,
  GameServerTestReachabilityDTOAPI,
  GameServerTestReachabilityInputDTOTypeEnum,
  GameServerUpdateDTO,
  IdUuidDTO,
  IdUuidDTOAPI,
  ModuleInstallationOutputDTO,
  ModuleInstallationOutputDTOAPI,
  ModuleInstallDTO,
  Settings,
  SettingsOutputDTOAPI,
  TestReachabilityOutputDTO,
} from '@takaro/apiclient';
import { InfiniteScroll as InfiniteScrollComponent } from '@takaro/lib-components';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { useApiClient } from 'hooks/useApiClient';
import { useSnackbar } from 'notistack';
import { hasNextPage } from '../util';
import * as Sentry from '@sentry/react';
import { AxiosError } from 'axios';
import { useMemo } from 'react';

export const gameServerKeys = {
  all: ['gameservers'] as const,
  list: () => [...gameServerKeys.all, 'list'] as const,
  detail: (id: string) => [...gameServerKeys.all, 'detail', id] as const,

  settings: (id?: string) => [...gameServerKeys.all, 'settings', id] as const,
  reachability: (id: string) => [...gameServerKeys.all, 'reachable', id] as const,
};

export const installedModuleKeys = {
  all: ['installed modules'] as const,
  list: (gameServerId: string) => [...installedModuleKeys.all, 'list', gameServerId] as const,
  detail: (gameServerId: string, moduleId: string) =>
    [...installedModuleKeys.all, 'detail', gameServerId, moduleId] as const,
};

export const useGameServers = ({
  page = 0,
  filters,
  sortBy,
  limit,
  search,
  sortDirection,
}: GameServerSearchInputDTO = {}) => {
  const apiClient = useApiClient();

  const queryOpts = useInfiniteQuery<GameServerOutputArrayDTOAPI, AxiosError<GameServerOutputArrayDTOAPI>>({
    queryKey: [gameServerKeys.list(), page, sortBy, sortDirection, filters, search],
    queryFn: async ({ pageParam = page }) =>
      (
        await apiClient.gameserver.gameServerControllerSearch({
          limit,
          sortBy,
          sortDirection,
          filters,
          search,
          page: pageParam,
        })
      ).data,
    getNextPageParam: (lastPage, pages) => hasNextPage(lastPage.meta, pages.length),
  });

  const InfiniteScroll = useMemo(() => {
    return <InfiniteScrollComponent {...queryOpts} />;
  }, [queryOpts]);

  return { ...queryOpts, InfiniteScroll };
};

export const useGameServer = (id: string) => {
  const apiClient = useApiClient();

  return useQuery<GameServerOutputDTO, AxiosError<GameServerOutputDTOAPI>>({
    queryKey: gameServerKeys.detail(id),
    queryFn: async () => {
      const resp = (await apiClient.gameserver.gameServerControllerGetOne(id)).data.data;
      return resp;
    },
    enabled: Boolean(id),
  });
};

export const useGameServerCreate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation<GameServerOutputDTO, AxiosError<GameServerOutputDTOAPI>, GameServerCreateDTO>({
    mutationFn: async (gameServer) => (await apiClient.gameserver.gameServerControllerCreate(gameServer)).data.data,
    onSuccess: async (newGameServer: GameServerOutputDTO) => {
      queryClient.setQueryData<InfiniteData<GameServerOutputArrayDTOAPI>>(gameServerKeys.list(), (prev) => {
        // in case there are no game servers yet
        if (!prev) {
          return {
            pages: [
              {
                data: [newGameServer],
                meta: {
                  page: 0,
                  total: 1,
                  limit: 100,
                  error: { code: '', message: '', details: '' },
                  serverTime: '',
                },
              },
            ],
            pageParams: [0],
          };
        }

        const newData = {
          ...prev,
          pages: prev?.pages.map((page) => ({
            ...page,
            data: [...page.data, newGameServer],
          })),
        };
        return newData;
      });

      enqueueSnackbar('Game server has been created', { variant: 'default' });
    },
  });
};

interface SendGameServerMessage {
  gameServerId: string;
}

export const useGameServerSendMessage = () => {
  const apiClient = useApiClient();

  return useMutation<APIOutput, AxiosError<APIOutput>, SendGameServerMessage>({
    mutationFn: async ({ gameServerId }) =>
      (await apiClient.gameserver.gameServerControllerSendMessage(gameServerId)).data,
  });
};

// TODO: implement pagination
export const useGameServerModuleInstallations = (gameServerId: string) => {
  const apiClient = useApiClient();
  return useQuery<ModuleInstallationOutputDTO[]>({
    queryKey: installedModuleKeys.list(gameServerId),
    queryFn: async () => (await apiClient.gameserver.gameServerControllerGetInstalledModules(gameServerId)).data.data,
  });
};

export const useGameServerModuleInstallation = (gameServerId: string, moduleId: string) => {
  const apiClient = useApiClient();

  return useQuery<ModuleInstallationOutputDTO, AxiosError<ModuleInstallationOutputDTOAPI>>({
    queryKey: installedModuleKeys.detail(gameServerId, moduleId),
    queryFn: async () =>
      (await apiClient.gameserver.gameServerControllerGetModuleInstallation(gameServerId, moduleId)).data.data,
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

  return useMutation<ModuleInstallationOutputDTO, AxiosError<ModuleInstallationOutputDTOAPI>, GameServerModuleInstall>({
    mutationFn: async ({ gameServerId, moduleId, moduleInstall }) =>
      (await apiClient.gameserver.gameServerControllerInstallModule(gameServerId, moduleId, moduleInstall)).data.data,
    onSuccess: async (moduleInstallation: ModuleInstallationOutputDTO) => {
      // invalidate list of installed modules
      queryClient.invalidateQueries(installedModuleKeys.list(moduleInstallation.gameserverId));

      queryClient.invalidateQueries(
        installedModuleKeys.detail(moduleInstallation.gameserverId, moduleInstallation.moduleId)
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
    AxiosError<ModuleInstallationOutputDTOAPI>,
    GameServerModuleUninstall
  >({
    mutationFn: async ({ gameServerId, moduleId }) =>
      (await apiClient.gameserver.gameServerControllerUninstallModule(gameServerId, moduleId)).data.data,
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

      queryClient.invalidateQueries(installedModuleKeys.detail(deletedModule.gameserverId, deletedModule.moduleId));
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

// SERVER SETTINGS
export const useGameServerSettings = (id?: string) => {
  const apiClient = useApiClient();

  return useQuery<Settings, AxiosError<SettingsOutputDTOAPI>>({
    queryKey: gameServerKeys.settings(id),
    queryFn: async () => (await apiClient.settings.settingsControllerGet(undefined, id)).data.data,
  });
};

interface GameServerUpdate {
  gameServerId: string;
  gameServerDetails: GameServerUpdateDTO;
}

export const useGameServerUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<GameServerOutputDTO, AxiosError<GameServerOutputDTO>, GameServerUpdate>({
    mutationFn: async ({ gameServerId, gameServerDetails }: GameServerUpdate) => {
      return (await apiClient.gameserver.gameServerControllerUpdate(gameServerId, gameServerDetails)).data.data;
    },
    onSuccess: async (updatedGameServer) => {
      try {
        // update gameServer in list of gameservers
        queryClient.setQueryData<InfiniteData<GameServerOutputArrayDTOAPI>>(gameServerKeys.list(), (prev) => {
          if (!prev) {
            queryClient.invalidateQueries(gameServerKeys.list());
            throw new Error('Cannot update gameserver list, because it does not exist');
          }

          return {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              data: page.data.map((gameServer) => {
                if (gameServer.id === updatedGameServer.id) {
                  return updatedGameServer;
                }
                return gameServer;
              }),
            })),
          };
        });

        // TODO: I think we can just update the detail query instead of invalidating it
        queryClient.invalidateQueries(gameServerKeys.detail(updatedGameServer.id));
      } catch (e) {
        // TODO: pass extra context to the error
        Sentry.captureException(e);
      }
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

interface GameServerRemove {
  id: string;
}

export const useGameServerRemove = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<IdUuidDTO, AxiosError<IdUuidDTOAPI>, GameServerRemove>({
    mutationFn: async ({ id }) => (await apiClient.gameserver.gameServerControllerRemove(id)).data.data,
    onSuccess: (removedGameServer: IdUuidDTO) => {
      try {
        // update list that contain this gameserver
        queryClient.setQueryData<InfiniteData<GameServerOutputArrayDTOAPI>>(gameServerKeys.list(), (prev) => {
          if (!prev) {
            throw new Error('Cannot remove gameserver from list, because list does not exist');
          }

          return {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              data: page.data.filter((gameServer) => gameServer.id !== removedGameServer.id),
            })),
          };
        });

        // remove all cached information about specific game server.
        queryClient.invalidateQueries({
          queryKey: gameServerKeys.detail(removedGameServer.id),
        });
        queryClient.invalidateQueries({
          queryKey: gameServerKeys.reachability(removedGameServer.id),
        });
      } catch (e) {
        // TODO: pass extra context to the error
        Sentry.captureException(e);
      }
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

export const useGameServerReachabilityById = (id: string) => {
  const apiClient = useApiClient();

  return useQuery<TestReachabilityOutputDTO, AxiosError<GameServerTestReachabilityDTOAPI>>({
    queryKey: gameServerKeys.reachability(id),
    queryFn: async () => (await apiClient.gameserver.gameServerControllerTestReachabilityForId(id)).data.data,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

interface GameServerTestReachabilityInput {
  type: GameServerTestReachabilityInputDTOTypeEnum;
  connectionInfo: string;
}

export const useGameServerReachabilityByConfig = () => {
  const apiClient = useApiClient();
  return useMutation<
    TestReachabilityOutputDTO,
    AxiosError<GameServerTestReachabilityDTOAPI>,
    GameServerTestReachabilityInput
  >({
    mutationFn: async ({
      type,
      connectionInfo,
    }: {
      type: GameServerTestReachabilityInputDTOTypeEnum;
      connectionInfo: string;
    }) => {
      return (
        await apiClient.gameserver.gameServerControllerTestReachability({
          type,
          connectionInfo,
        })
      ).data.data;

      // TODO:
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};
