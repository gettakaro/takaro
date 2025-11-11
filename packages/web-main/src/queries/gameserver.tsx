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
  ImportOutputDTO,
  InstallModuleDTO,
  KickPlayerInputDTO,
  MapInfoDTO,
  MapTileInputDTO,
  ModuleInstallationOutputDTO,
  ModuleInstallationOutputDTOAPI,
  ModuleInstallationSearchInputDTO,
  TeleportPlayerInputDTO,
  TestReachabilityOutputDTO,
} from '@takaro/apiclient';
import {
  useMutation,
  useQueryClient,
  queryOptions,
  infiniteQueryOptions,
  keepPreviousData,
} from '@tanstack/react-query';
import { getApiClient } from '../util/getApiClient';
import { getNextPage, mutationWrapper, queryParamsToArray } from './util';
import { AxiosError } from 'axios';
import { ErrorMessageMapping } from '@takaro/lib-components/src/errors';
import { useSnackbar } from 'notistack';
import { moduleKeys } from './module';
import { pogKeys } from './pog';

export const gameServerKeys = {
  all: ['gameservers'] as const,
  list: () => [...gameServerKeys.all, 'list'] as const,
  detail: (gameServerId: string) => [...gameServerKeys.all, 'detail', gameServerId] as const,
  mapInfo: (gameServerId: string) => [...gameServerKeys.all, 'map', gameServerId] as const,
  reachability: (gameServerId: string) => [...gameServerKeys.all, 'reachable', gameServerId] as const,
  count: () => [...gameServerKeys.all, 'count'] as const,
};

export const ModuleInstallationKeys = {
  all: ['installed modules'] as const,
  list: () => [...ModuleInstallationKeys.all, 'list'] as const,
  detail: (gameServerId: string, versionId: string) =>
    [...ModuleInstallationKeys.all, 'detail', gameServerId, versionId] as const,
};

const defaultGameServerErrorMessages: Partial<ErrorMessageMapping> = {
  UniqueConstraintError: 'Game server with this name already exists.',
};

export const gameServersQueryOptions = (queryParams: GameServerSearchInputDTO = {}) => {
  return queryOptions<GameServerOutputArrayDTOAPI, AxiosError<GameServerOutputArrayDTOAPI>>({
    queryKey: [...gameServerKeys.list(), 'table', ...queryParamsToArray(queryParams)],
    queryFn: async () => (await getApiClient().gameserver.gameServerControllerSearch(queryParams)).data,
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

export const gameServerCountQueryOptions = () =>
  queryOptions<number, AxiosError<number>>({
    queryKey: gameServerKeys.count(),
    queryFn: async () => (await getApiClient().gameserver.gameServerControllerSearch({ limit: 1 })).data.meta.total!,
  });

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
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: gameServerKeys.list() });
        const currentGameServerCount = queryClient.getQueryData<number>(gameServerKeys.count());
        if (currentGameServerCount) {
          queryClient.setQueryData<number>(gameServerKeys.count(), currentGameServerCount + 1);
        }
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

        const currentGameServerCount = queryClient.getQueryData<number>(gameServerKeys.count());
        if (currentGameServerCount) {
          queryClient.setQueryData<number>(gameServerKeys.count(), currentGameServerCount + 1);
        }
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

        const currentGameServerCount = queryClient.getQueryData<number>(gameServerKeys.count());
        if (currentGameServerCount) {
          queryClient.setQueryData<number>(gameServerKeys.count(), currentGameServerCount - 1);
        }

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

interface ResetCurrencyInput {
  gameServerId: string;
}

export const useGameServerResetCurrency = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<any, ResetCurrencyInput>(
    useMutation<any, AxiosError<any>, ResetCurrencyInput>({
      mutationFn: async ({ gameServerId }) => {
        const response = await apiClient.gameserver.gameServerControllerResetCurrency(gameServerId);
        return response.data;
      },
      onSuccess: async (data) => {
        const affectedCount = data?.affectedPlayerCount || 0;
        enqueueSnackbar(`Successfully reset currency for ${affectedCount} players`, {
          variant: 'default',
          type: 'success',
        });
        // Invalidate player queries to refresh the UI
        await queryClient.invalidateQueries({
          queryKey: pogKeys.all,
        });
      },
    }),
    {},
  );
};

export const moduleInstallationsOptions = (queryParams: ModuleInstallationSearchInputDTO = {}) => {
  return queryOptions<ModuleInstallationOutputDTO[], AxiosError<ModuleInstallationOutputDTOAPI>>({
    queryKey: [...ModuleInstallationKeys.list(), ...queryParamsToArray(queryParams)],
    queryFn: async () =>
      (await getApiClient().module.moduleInstallationsControllerGetInstalledModules(queryParams)).data.data,
  });
};

export const gameServerModuleInstallationOptions = (moduleId: string, gameServerId: string) => {
  return queryOptions<ModuleInstallationOutputDTO, AxiosError<ModuleInstallationOutputDTOAPI>>({
    queryKey: ModuleInstallationKeys.detail(gameServerId, moduleId),
    queryFn: async () =>
      (await getApiClient().module.moduleInstallationsControllerGetModuleInstallation(moduleId, gameServerId)).data
        .data,
  });
};

export const gameServerMapInfoOptions = (gameServerId: string) => {
  return queryOptions<MapInfoDTO, AxiosError<MapInfoDTO>>({
    queryKey: gameServerKeys.mapInfo(gameServerId),
    queryFn: async () =>
      ((await getApiClient().gameserver.gameServerControllerGetMapInfo(gameServerId)).data as any).data as MapInfoDTO,
  });
};

// export const gameServerMapTileOptions = (input: MapTileInputDTO) => {
//   return queryOptions<unknown, AxiosError<unknown>>({
//     queryKey: gameServerKeys.mapTile(input.id, input.x, input.y, input.z),
//     queryFn: async () =>
//       (await getApiClient().gameserver.gameServerControllerGetMapTile(input.id, input.x.toString(), input.y.toString(), input.z.toString())).data.data as unknown as
//   });
// };

export const useGameServerModuleInstall = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<ModuleInstallationOutputDTO, InstallModuleDTO>(
    useMutation<ModuleInstallationOutputDTO, AxiosError<ModuleInstallationOutputDTOAPI>, InstallModuleDTO>({
      mutationFn: async (moduleInstallation) =>
        (await apiClient.module.moduleInstallationsControllerInstallModule(moduleInstallation)).data.data,
      onSuccess: async (moduleInstallation, { gameServerId }) => {
        // invalidate list of installed modules
        await queryClient.invalidateQueries({ queryKey: ModuleInstallationKeys.list() });

        // invalidate the versions query
        await queryClient.invalidateQueries({ queryKey: moduleKeys.versions.list(moduleInstallation.id) });

        // invalidate the version query
        await queryClient.invalidateQueries();

        // update installed module cache
        queryClient.setQueryData<ModuleInstallationOutputDTO>(
          ModuleInstallationKeys.detail(gameServerId, moduleInstallation.moduleId),
          moduleInstallation,
        );
      },
    }),
    {},
  );
};

interface GameServerModuleUninstall {
  gameServerId: string;
  versionId: string;
  moduleId: string;
}

export const useGameServerModuleUninstall = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<ModuleInstallationOutputDTO, GameServerModuleUninstall>(
    useMutation<ModuleInstallationOutputDTO, AxiosError<ModuleInstallationOutputDTOAPI>, GameServerModuleUninstall>({
      mutationFn: async ({ gameServerId, moduleId }) =>
        (await apiClient.module.moduleInstallationsControllerUninstallModule(moduleId, gameServerId)).data.data,
      onSuccess: async (_, { versionId, gameServerId }) => {
        queryClient.invalidateQueries({ queryKey: ModuleInstallationKeys.list() });

        queryClient.removeQueries({
          queryKey: ModuleInstallationKeys.detail(gameServerId, versionId),
        });
      },
    }),
    {},
  );
};

interface GameServerKickPlayerInput extends KickPlayerInputDTO {
  gameServerId: string;
  playerId: string;
}

export const useKickPlayerOnGameServer = () => {
  const apiClient = getApiClient();

  return mutationWrapper<APIOutput, GameServerKickPlayerInput>(
    useMutation<APIOutput, AxiosError<APIOutput>, GameServerKickPlayerInput>({
      mutationFn: async ({ gameServerId, playerId, ...opts }) =>
        (await apiClient.gameserver.gameServerControllerKickPlayer(gameServerId, playerId, opts)).data,
    }),
    {},
  );
};

interface TeleportPlayerInput extends TeleportPlayerInputDTO {
  gameServerId: string;
  playerId: string;
}
export const useTeleportPlayer = () => {
  const apiClient = getApiClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<APIOutput, TeleportPlayerInput>(
    useMutation<APIOutput, AxiosError<APIOutput>, TeleportPlayerInput>({
      mutationFn: async ({ gameServerId, playerId, x, y, z }) =>
        (await apiClient.gameserver.gameServerControllerTeleportPlayer(gameServerId, playerId, { x, y, z })).data,
      onSuccess: async (_, { x, y, z }) => {
        enqueueSnackbar(`Teleported player to (${x},${y},${z})`, { variant: 'default', type: 'info' });
      },
    }),
    {},
  );
};

export const useGameServerShutdown = () => {
  const apiClient = getApiClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<APIOutput, string>(
    useMutation<void, AxiosError<void>, string>({
      mutationFn: async (gameServerId) => (await apiClient.gameserver.gameServerControllerShutdown(gameServerId)).data,
      onSuccess: async () => {
        enqueueSnackbar('Gameserver shutdown.', { variant: 'default', type: 'info' });
      },
    }),
    {},
  );
};

export const useGameServerResetToken = () => {
  const apiClient = getApiClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<APIOutput, void>(
    useMutation<void, AxiosError<void>, void>({
      mutationFn: async () => {
        await apiClient.gameserver.gameServerControllerRegenerateRegistrationToken();
      },
      onSuccess: async () => {
        enqueueSnackbar('Gameserver registration token reset.', { variant: 'default', type: 'info' });
      },
    }),
    {},
  );
};
