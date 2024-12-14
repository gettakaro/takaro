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
  ImportOutputDTO,
  KickPlayerInputDTO,
  ModuleInstallationOutputDTO,
  ModuleInstallationOutputDTOAPI,
  InstallModuleDTO,
  TestReachabilityOutputDTO,
} from '@takaro/apiclient';
import {
  useMutation,
  useQueryClient,
  queryOptions,
  infiniteQueryOptions,
  keepPreviousData,
} from '@tanstack/react-query';
import { getApiClient } from 'util/getApiClient';
import { getNextPage, mutationWrapper, queryParamsToArray } from './util';
import { AxiosError } from 'axios';
import { ErrorMessageMapping } from '@takaro/lib-components/src/errors';
import { useSnackbar } from 'notistack';

export const gameServerKeys = {
  all: ['gameservers'] as const,
  list: () => [...gameServerKeys.all, 'list'] as const,
  detail: (gameServerId: string) => [...gameServerKeys.all, 'detail', gameServerId] as const,
  reachability: (gameServerId: string) => [...gameServerKeys.all, 'reachable', gameServerId] as const,
};

export const installedModuleKeys = {
  all: ['installed modules'] as const,
  list: (gameServerId: string) => [...installedModuleKeys.all, 'list', gameServerId] as const,
  detail: (installationId: string) => [...installedModuleKeys.all, 'detail', installationId] as const,
};

const defaultGameServerErrorMessages: Partial<ErrorMessageMapping> = {
  UniqueConstraintError: 'Game server with this name already exists.',
};

export const gameServersQueryOptions = (queryParams: GameServerSearchInputDTO = {}) => {
  return queryOptions<GameServerOutputDTO[], AxiosError<GameServerOutputArrayDTOAPI>>({
    queryKey: [...gameServerKeys.list(), ...queryParamsToArray(queryParams)],
    queryFn: async () => (await getApiClient().gameserver.gameServerControllerSearch(queryParams)).data.data,
  });
};

export const gameServersInfiniteQueryOptions = (queryParams: GameServerSearchInputDTO = {}) => {
  return infiniteQueryOptions<GameServerOutputArrayDTOAPI, AxiosError<GameServerOutputArrayDTOAPI>>({
    queryKey: [...gameServerKeys.list(), 'infinite', ...queryParamsToArray(queryParams)],
    queryFn: async ({ pageParam }) =>
      (await getApiClient().gameserver.gameServerControllerSearch({ ...queryParams, page: pageParam as number })).data,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => getNextPage(lastPage.meta),
    placeholderData: keepPreviousData,
  });
};

export const gameServerQueryOptions = (gameServerId: string) => {
  return queryOptions<GameServerOutputDTO, AxiosError<GameServerOutputDTOAPI>>({
    queryKey: gameServerKeys.detail(gameServerId),
    queryFn: async () => (await getApiClient().gameserver.gameServerControllerGetOne(gameServerId)).data.data,
  });
};

export const useGameServerCreateFromCSMMImport = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<ImportOutputDTO, any>(
    useMutation<ImportOutputDTO, AxiosError<any>, unknown>({
      mutationFn: async (config) =>
        (
          await apiClient.gameserver.gameServerControllerImportFromCSMM({
            data: config,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
        ).data.data,
      onSettled: async () => {
        await queryClient.invalidateQueries({ queryKey: gameServerKeys.list() });
      },
    }),
    {},
  );
};

export const useGameServerCreate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<GameServerOutputDTO, GameServerCreateDTO>(
    useMutation<GameServerOutputDTO, AxiosError<GameServerOutputDTOAPI>, GameServerCreateDTO>({
      mutationFn: async (gameServer) => (await apiClient.gameserver.gameServerControllerCreate(gameServer)).data.data,
      onSuccess: async (newGameServer: GameServerOutputDTO) => {
        enqueueSnackbar('Gameserver created!', { variant: 'default', type: 'success' });
        await queryClient.invalidateQueries({ queryKey: gameServerKeys.list() });
        queryClient.setQueryData(gameServerKeys.detail(newGameServer.id), newGameServer);
      },
    }),
    defaultGameServerErrorMessages,
  );
};

interface GameServerUpdate {
  gameServerId: string;
  gameServerDetails: GameServerUpdateDTO;
}

export const useGameServerUpdate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<GameServerOutputDTO, GameServerUpdate>(
    useMutation<GameServerOutputDTO, AxiosError<GameServerOutputDTO>, GameServerUpdate>({
      mutationFn: async ({ gameServerId, gameServerDetails }: GameServerUpdate) => {
        return (await apiClient.gameserver.gameServerControllerUpdate(gameServerId, gameServerDetails)).data.data;
      },
      onSuccess: async (updatedGameServer) => {
        enqueueSnackbar('Gameserver updated!', { variant: 'default', type: 'success' });
        await queryClient.invalidateQueries({ queryKey: gameServerKeys.list() });
        queryClient.setQueryData(gameServerKeys.detail(updatedGameServer.id), updatedGameServer);
      },
    }),
    defaultGameServerErrorMessages,
  );
};

interface GameServerRemove {
  gameServerId: string;
}

export const useGameServerRemove = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<APIOutput, GameServerRemove>(
    useMutation<APIOutput, AxiosError<APIOutput>, GameServerRemove>({
      mutationFn: async ({ gameServerId }) =>
        (await apiClient.gameserver.gameServerControllerRemove(gameServerId)).data,
      onSuccess: async (_, { gameServerId }) => {
        enqueueSnackbar('Gameserver successfully deleted', { variant: 'default', type: 'success' });
        await queryClient.invalidateQueries({ queryKey: gameServerKeys.list() });
        await queryClient.invalidateQueries({
          queryKey: gameServerKeys.detail(gameServerId),
        });
        queryClient.removeQueries({
          queryKey: gameServerKeys.reachability(gameServerId),
        });
      },
    }),
    {},
  );
};

export const gameServerReachabilityOptions = (gameServerId: string) =>
  queryOptions<TestReachabilityOutputDTO, AxiosError<GameServerTestReachabilityDTOAPI>>({
    queryKey: gameServerKeys.reachability(gameServerId),
    queryFn: async () =>
      (await getApiClient().gameserver.gameServerControllerTestReachabilityForId(gameServerId)).data.data,
  });

interface GameServerTestReachabilityInput {
  type: GameServerTestReachabilityInputDTOTypeEnum;
  connectionInfo: string;
}

export const useGameServerReachabilityByConfig = () => {
  const apiClient = getApiClient();
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
    {},
  );
};

interface SendGameServerMessage {
  gameServerId: string;
}

export const useGameServerSendMessage = () => {
  const apiClient = getApiClient();

  return mutationWrapper<APIOutput, SendGameServerMessage>(
    useMutation<APIOutput, AxiosError<APIOutput>, SendGameServerMessage>({
      mutationFn: async ({ gameServerId }) =>
        (await apiClient.gameserver.gameServerControllerSendMessage(gameServerId)).data,
    }),
    {},
  );
};

export const gameServerModuleInstallationsOptions = (gameServerId: string) => {
  return queryOptions<ModuleInstallationOutputDTO[], AxiosError<ModuleInstallationOutputDTOAPI>>({
    queryKey: installedModuleKeys.list(gameServerId),
    queryFn: async () =>
      (
        await getApiClient().module.moduleInstallationsControllerGetInstalledModules({
          filters: { gameServerId: [gameServerId] },
        })
      ).data.data,
  });
};

export const gameServerModuleInstallationOptions = (installationId: string) => {
  return queryOptions<ModuleInstallationOutputDTO, AxiosError<ModuleInstallationOutputDTOAPI>>({
    queryKey: installedModuleKeys.detail(installationId),
    queryFn: async () =>
      (await getApiClient().module.moduleInstallationsControllerGetModuleInstallation(installationId)).data.data,
  });
};

export const useGameServerModuleInstall = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<ModuleInstallationOutputDTO, InstallModuleDTO>(
    useMutation<ModuleInstallationOutputDTO, AxiosError<ModuleInstallationOutputDTOAPI>, InstallModuleDTO>({
      mutationFn: async (installDTO) =>
        (await apiClient.module.moduleInstallationsControllerInstallModule(installDTO)).data.data,
      onSuccess: async (moduleInstallation: ModuleInstallationOutputDTO) => {
        // invalidate list of installed modules
        await queryClient.invalidateQueries({ queryKey: installedModuleKeys.list(moduleInstallation.gameserverId) });

        // update installed module cache
        queryClient.setQueryData(installedModuleKeys.detail(moduleInstallation.id), moduleInstallation);
      },
    }),
    {},
  );
};

interface GameServerModuleUninstall {
  installationId: string;
}

export const useGameServerModuleUninstall = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<ModuleInstallationOutputDTO, GameServerModuleUninstall>(
    useMutation<ModuleInstallationOutputDTO, AxiosError<ModuleInstallationOutputDTOAPI>, GameServerModuleUninstall>({
      mutationFn: async ({ installationId }) =>
        (await apiClient.module.moduleInstallationsControllerUninstallModule(installationId)).data.data,
      onSuccess: async (data, { installationId }) => {
        queryClient.setQueryData<ModuleInstallationOutputDTO[]>(installedModuleKeys.list(data.gameserverId), (old) => {
          return old
            ? old.filter((installedModule) => {
                return installedModule.id !== installationId;
              })
            : old;
        });
        await queryClient.invalidateQueries({
          queryKey: installedModuleKeys.detail(installationId),
        });
      },
    }),
    {},
  );
};

interface GameServerKickPlayerInput {
  gameServerId: string;
  playerId: string;
  opts: KickPlayerInputDTO;
}

export const useKickPlayerOnGameServer = () => {
  const apiClient = getApiClient();

  return mutationWrapper<APIOutput, GameServerKickPlayerInput>(
    useMutation<APIOutput, AxiosError<APIOutput>, GameServerKickPlayerInput>({
      mutationFn: async ({ gameServerId, playerId, opts }) =>
        (await apiClient.gameserver.gameServerControllerKickPlayer(gameServerId, playerId, opts)).data,
    }),
    {},
  );
};

interface GameServerBanPlayerInput {
  gameServerId: string;
  playerId: string;
  opts: BanPlayerInputDTO;
}

export const useBanPlayerOnGameServer = () => {
  const apiClient = getApiClient();

  return mutationWrapper<APIOutput, GameServerBanPlayerInput>(
    useMutation<APIOutput, AxiosError<APIOutput>, GameServerBanPlayerInput>({
      mutationFn: async ({ gameServerId, playerId, opts }) =>
        (await apiClient.gameserver.gameServerControllerBanPlayer(gameServerId, playerId, opts)).data,
    }),
    {},
  );
};

interface GameServerUnbanPlayerInput {
  gameServerId: string;
  playerId: string;
}

export const useUnbanPlayerOnGameServer = () => {
  const apiClient = getApiClient();

  return mutationWrapper<APIOutput, GameServerUnbanPlayerInput>(
    useMutation<APIOutput, AxiosError<APIOutput>, GameServerUnbanPlayerInput>({
      mutationFn: async ({ gameServerId, playerId }) =>
        (await apiClient.gameserver.gameServerControllerUnbanPlayer(gameServerId, playerId)).data,
    }),
    {},
  );
};
