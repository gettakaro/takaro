import {
  APIOutput,
  BanPlayerInputDTO,
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
  ImportOutputDTO,
  KickPlayerInputDTO,
  ModuleInstallationOutputDTO,
  ModuleInstallationOutputDTOAPI,
  ModuleInstallDTO,
  TestReachabilityOutputDTO,
} from '@takaro/apiclient';
import { InfiniteScroll as InfiniteScrollComponent } from '@takaro/lib-components';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { useApiClient } from 'hooks/useApiClient';
import { useSnackbar } from 'notistack';
import { hasNextPage, mutationWrapper } from '../util';
import { AxiosError } from 'axios';
import { useMemo } from 'react';
import { queryClient } from 'queryClient';
import { ErrorMessageMapping } from '@takaro/lib-components/src/errors';

export const gameServerKeys = {
  all: ['gameservers'] as const,
  list: () => [...gameServerKeys.all, 'list'] as const,
  detail: (id: string) => [...gameServerKeys.all, 'detail', id] as const,
  reachability: (id: string) => [...gameServerKeys.all, 'reachable', id] as const,
};

export const installedModuleKeys = {
  all: ['installed modules'] as const,
  list: (gameServerId: string) => [...installedModuleKeys.all, 'list', gameServerId] as const,
  detail: (gameServerId: string, moduleId: string) =>
    [...installedModuleKeys.all, 'detail', gameServerId, moduleId] as const,
};

const defaultGameServerErrorMessages: Partial<ErrorMessageMapping> = {
  UniqueConstraintError: 'Game server with this name already exists',
};

export const useGameServers = (
  queryParams: GameServerSearchInputDTO = { page: 0 },
  opts?: any // TODO: not sure how to type this
) => {
  const apiClient = useApiClient();

  const queryOpts = useInfiniteQuery<GameServerOutputArrayDTOAPI, AxiosError<GameServerOutputArrayDTOAPI>>({
    queryKey: [...gameServerKeys.list(), { ...queryParams }],
    queryFn: async ({ pageParam }) =>
      (
        await apiClient.gameserver.gameServerControllerSearch({
          ...queryParams,
          page: pageParam as number,
        })
      ).data,
    initialPageParam: queryParams.page,
    placeholderData: keepPreviousData,
    getNextPageParam: (lastPage, pages) => hasNextPage(lastPage.meta, pages.length),
    ...opts,
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

interface CreateGameServerFromCSMMInput {
  config: FormData;
}
export const useGameServerCreateFromCSMMImport = () => {
  const apiClient = useApiClient();

  return mutationWrapper<ImportOutputDTO, CreateGameServerFromCSMMInput>(
    useMutation<ImportOutputDTO, AxiosError<any>, CreateGameServerFromCSMMInput>({
      mutationFn: async (config) =>
        (
          await apiClient.gameserver.gameServerControllerImportFromCSMM({
            data: config,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
        ).data.data,
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: gameServerKeys.list() });
      },
    }),
    {}
  );
};

export const useGameServerCreate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<GameServerOutputDTO, GameServerCreateDTO>(
    useMutation<GameServerOutputDTO, AxiosError<any>, GameServerCreateDTO>({
      mutationFn: async (gameServer) => (await apiClient.gameserver.gameServerControllerCreate(gameServer)).data.data,
      onSuccess: async (newGameServer: GameServerOutputDTO) => {
        // invalidate all queries that have list in the key
        await queryClient.invalidateQueries({ queryKey: gameServerKeys.list() });
        queryClient.setQueryData(gameServerKeys.detail(newGameServer.id), newGameServer);
        enqueueSnackbar('Game server has been created', { variant: 'default' });
      },
    }),
    defaultGameServerErrorMessages
  );
};

interface GameServerUpdate {
  gameServerId: string;
  gameServerDetails: GameServerUpdateDTO;
}

export const useGameServerUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<GameServerOutputDTO, GameServerUpdate>(
    useMutation<GameServerOutputDTO, AxiosError<GameServerOutputDTO>, GameServerUpdate>({
      mutationFn: async ({ gameServerId, gameServerDetails }: GameServerUpdate) => {
        return (await apiClient.gameserver.gameServerControllerUpdate(gameServerId, gameServerDetails)).data.data;
      },
      onSuccess: async (updatedGameServer) => {
        // remove cache of gameserver list
        await queryClient.invalidateQueries({ queryKey: gameServerKeys.list() });

        // update cache of gameserver
        queryClient.setQueryData(gameServerKeys.detail(updatedGameServer.id), updatedGameServer);
      },
    }),
    defaultGameServerErrorMessages
  );
};

interface GameServerRemove {
  id: string;
}

export const useGameServerRemove = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<IdUuidDTO, GameServerRemove>(
    useMutation<IdUuidDTO, AxiosError<IdUuidDTOAPI>, GameServerRemove>({
      mutationFn: async ({ id }) => (await apiClient.gameserver.gameServerControllerRemove(id)).data.data,
      onSuccess: async (removedGameServer: IdUuidDTO) => {
        // remove all cached information of game server list.
        await queryClient.invalidateQueries({ queryKey: gameServerKeys.list() });
        // remove all cached information about specific game server.
        await queryClient.invalidateQueries({
          queryKey: gameServerKeys.detail(removedGameServer.id),
        });
        queryClient.removeQueries({
          queryKey: gameServerKeys.reachability(removedGameServer.id),
        });
      },
    }),
    {}
  );
};

export const useGameServerReachabilityById = (id: string) => {
  const apiClient = useApiClient();

  return useQuery<TestReachabilityOutputDTO, AxiosError<GameServerTestReachabilityDTOAPI>>({
    queryKey: gameServerKeys.reachability(id),
    queryFn: async () => (await apiClient.gameserver.gameServerControllerTestReachabilityForId(id)).data.data,
  });
};

interface GameServerTestReachabilityInput {
  type: GameServerTestReachabilityInputDTOTypeEnum;
  connectionInfo: string;
}

export const useGameServerReachabilityByConfig = () => {
  const apiClient = useApiClient();
  return mutationWrapper<TestReachabilityOutputDTO, GameServerTestReachabilityInput>(
    useMutation<
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
      },
    }),
    {}
  );
};

interface SendGameServerMessage {
  gameServerId: string;
}

export const useGameServerSendMessage = () => {
  const apiClient = useApiClient();

  return mutationWrapper<APIOutput, SendGameServerMessage>(
    useMutation<APIOutput, AxiosError<APIOutput>, SendGameServerMessage>({
      mutationFn: async ({ gameServerId }) =>
        (await apiClient.gameserver.gameServerControllerSendMessage(gameServerId)).data,
    }),
    {}
  );
};

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

  return mutationWrapper<ModuleInstallationOutputDTO, GameServerModuleInstall>(
    useMutation<ModuleInstallationOutputDTO, AxiosError<ModuleInstallationOutputDTOAPI>, GameServerModuleInstall>({
      mutationFn: async ({ gameServerId, moduleId, moduleInstall }) =>
        (await apiClient.gameserver.gameServerControllerInstallModule(gameServerId, moduleId, moduleInstall)).data.data,
      onSuccess: async (moduleInstallation: ModuleInstallationOutputDTO) => {
        // invalidate list of installed modules
        await queryClient.invalidateQueries({ queryKey: installedModuleKeys.list(moduleInstallation.gameserverId) });

        // update installed module cache
        queryClient.setQueryData(
          installedModuleKeys.detail(moduleInstallation.gameserverId, moduleInstallation.moduleId),
          moduleInstallation
        );
      },
    }),
    {}
  );
};

interface GameServerModuleUninstall {
  gameServerId: string;
  moduleId: string;
}

export const useGameServerModuleUninstall = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<ModuleInstallationOutputDTO, GameServerModuleUninstall>(
    useMutation<ModuleInstallationOutputDTO, AxiosError<ModuleInstallationOutputDTOAPI>, GameServerModuleUninstall>({
      mutationFn: async ({ gameServerId, moduleId }) =>
        (await apiClient.gameserver.gameServerControllerUninstallModule(gameServerId, moduleId)).data.data,
      onSuccess: async (deletedModule: ModuleInstallationOutputDTO) => {
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
        await queryClient.invalidateQueries({
          queryKey: installedModuleKeys.detail(deletedModule.gameserverId, deletedModule.moduleId),
        });
      },
    }),
    {}
  );
};

interface GameServerKickPlayerInput {
  gameServerId: string;
  playerId: string;
  opts: KickPlayerInputDTO;
}

export const useKickPlayerOnGameServer = () => {
  const apiClient = useApiClient();

  return mutationWrapper<APIOutput, GameServerKickPlayerInput>(
    useMutation<APIOutput, AxiosError<APIOutput>, GameServerKickPlayerInput>({
      mutationFn: async ({ gameServerId, playerId, opts }) =>
        (await apiClient.gameserver.gameServerControllerKickPlayer(gameServerId, playerId, opts)).data,
    }),
    {}
  );
};

interface GameServerBanPlayerInput {
  gameServerId: string;
  playerId: string;
  opts: BanPlayerInputDTO;
}

export const useBanPlayerOnGameServer = () => {
  const apiClient = useApiClient();

  return mutationWrapper<APIOutput, GameServerBanPlayerInput>(
    useMutation<APIOutput, AxiosError<APIOutput>, GameServerBanPlayerInput>({
      mutationFn: async ({ gameServerId, playerId, opts }) =>
        (await apiClient.gameserver.gameServerControllerBanPlayer(gameServerId, playerId, opts)).data,
    }),
    {}
  );
};

interface GameServerUnbanPlayerInput {
  gameServerId: string;
  playerId: string;
}

export const useUnbanPlayerOnGameServer = () => {
  const apiClient = useApiClient();

  return mutationWrapper<APIOutput, GameServerUnbanPlayerInput>(
    useMutation<APIOutput, AxiosError<APIOutput>, GameServerUnbanPlayerInput>({
      mutationFn: async ({ gameServerId, playerId }) =>
        (await apiClient.gameserver.gameServerControllerUnbanPlayer(gameServerId, playerId)).data,
    }),
    {}
  );
};
