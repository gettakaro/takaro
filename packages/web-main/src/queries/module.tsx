import {
  useMutation,
  useQueryClient,
  queryOptions,
  infiniteQueryOptions,
  keepPreviousData,
} from '@tanstack/react-query';
import { getApiClient } from 'util/getApiClient';
import {
  APIOutput,
  CommandCreateDTO,
  CommandOutputDTO,
  CommandOutputDTOAPI,
  CommandUpdateDTO,
  CronJobCreateDTO,
  CronJobOutputDTO,
  CronJobOutputDTOAPI,
  CronJobUpdateDTO,
  FunctionCreateDTO,
  FunctionOutputDTO,
  FunctionOutputDTOAPI,
  FunctionUpdateDTO,
  HookCreateDTO,
  HookOutputDTO,
  HookOutputDTOAPI,
  HookUpdateDTO,
  ModuleCreateAPIDTO,
  ModuleExportOptionsDTO,
  ModuleOutputArrayDTOAPI,
  ModuleOutputDTO,
  ModuleOutputDTOAPI,
  ModuleSearchInputDTO,
  ModuleTransferDTO,
  ModuleUpdateDTO,
  ModuleVersionOutputArrayDTOAPI,
  ModuleVersionOutputDTO,
  ModuleVersionSearchInputDTO,
} from '@takaro/apiclient';

import { queryParamsToArray, getNextPage, mutationWrapper } from './util';
import { AxiosError, AxiosResponse } from 'axios';
import { ErrorMessageMapping } from '@takaro/lib-components/src/errors';
import { queryClient } from 'queryClient';
import { useSnackbar } from 'notistack';

export const moduleKeys = {
  all: ['modules'] as const,
  detail: (moduleId: string) => [...moduleKeys.all, 'detail', moduleId] as const,
  export: (versionId: string) => [...moduleKeys.all, 'export', versionId] as const,
  list: () => [...moduleKeys.all, 'list'] as const,
  count: () => [...moduleKeys.all, 'count'] as const,

  versions: {
    all: ['versions'] as const,
    list: (moduleId?: string) => [...moduleKeys.versions.all, 'list', moduleId] as const,
    detail: (versionId: string) => [...moduleKeys.versions.all, 'detail', versionId] as const,
  },

  hooks: {
    all: ['hooks'] as const,
    list: () => [...moduleKeys.hooks.all, 'list'] as const,
    detail: (id: string) => [...moduleKeys.hooks.all, 'detail', id] as const,
  },
  commands: {
    all: ['commands'] as const,
    list: () => [...moduleKeys.commands.all, 'list'] as const,
    detail: (commandId: string) => [...moduleKeys.commands.all, 'detail', commandId] as const,
  },
  cronJobs: {
    all: ['cronjobs'] as const,
    list: () => [...moduleKeys.cronJobs.all, 'list'] as const,
    detail: (cronjobId: string) => [...moduleKeys.cronJobs.all, 'detail', cronjobId] as const,
  },
  functions: {
    all: ['functions'] as const,
    list: () => [...moduleKeys.functions.all, 'list'] as const,
    detail: (functionId: string) => [...moduleKeys.functions.all, 'detail', functionId] as const,
  },
};

const defaultModuleErrorMessages: Partial<ErrorMessageMapping> = {
  UniqueConstraintError: 'Module with this name already exists',
};
const defaultHookErrorMessages: Partial<ErrorMessageMapping> = {
  UniqueConstraintError: 'Hook with this name already exists',
};
const defaultCommandErrorMessages: Partial<ErrorMessageMapping> = {
  UniqueConstraintError: 'Command with this name already exists',
};
const defaultCronJobErrorMessages: Partial<ErrorMessageMapping> = {
  UniqueConstraintError: 'CronJob with this name already exists',
};
const defaultFunctionErrorMessages: Partial<ErrorMessageMapping> = {
  UniqueConstraintError: 'Function with this name already exists',
};

export const modulesQueryOptions = (queryParams: ModuleSearchInputDTO = {}) =>
  queryOptions<ModuleOutputArrayDTOAPI, AxiosError<ModuleOutputArrayDTOAPI>>({
    queryKey: [...moduleKeys.list(), ...queryParamsToArray(queryParams)],
    queryFn: async () => (await getApiClient().module.moduleControllerSearch(queryParams)).data,
  });

export const modulesInfiniteQueryOptions = (queryParams: ModuleSearchInputDTO = {}) =>
  infiniteQueryOptions<ModuleOutputArrayDTOAPI, AxiosError<ModuleOutputArrayDTOAPI>>({
    queryKey: [...moduleKeys.list(), 'infinite', ...queryParamsToArray(queryParams)],
    queryFn: async ({ pageParam }) =>
      (await getApiClient().module.moduleControllerSearch({ ...queryParams, page: pageParam as number })).data,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => getNextPage(lastPage.meta),
    placeholderData: keepPreviousData,
  });

export const moduleQueryOptions = (moduleId: string) =>
  queryOptions<ModuleOutputDTO, AxiosError<ModuleOutputDTOAPI>>({
    queryKey: moduleKeys.detail(moduleId),
    queryFn: async () => (await getApiClient().module.moduleControllerGetOne(moduleId)).data.data,
  });

export const customModuleCountQueryOptions = () =>
  queryOptions<number, AxiosError<number>>({
    queryKey: moduleKeys.count(),
    queryFn: async () =>
      (await getApiClient().module.moduleControllerSearch({ filters: { builtin: ['null'] }, limit: 1 })).data.meta
        .total!,
  });

export const moduleVersionsQueryOptions = (queryParams: ModuleVersionSearchInputDTO) =>
  queryOptions<ModuleVersionOutputArrayDTOAPI, AxiosError<ModuleVersionOutputArrayDTOAPI>>({
    // TODO: (for now) ideally we always pass a moduleId here,
    queryKey: [...moduleKeys.versions.list(), ...queryParamsToArray(queryParams)],
    queryFn: async () => (await getApiClient().module.moduleVersionControllerSearchVersions(queryParams)).data,
  });

export const moduleVersionsInfiniteQueryOptions = (queryParams: ModuleVersionSearchInputDTO = {}) =>
  infiniteQueryOptions<ModuleVersionOutputArrayDTOAPI, AxiosError<ModuleVersionOutputArrayDTOAPI>>({
    // TODO: (for now) ideally we always pass a moduleId here.
    queryKey: [...moduleKeys.versions.list(), 'infinite', ...queryParamsToArray(queryParams)],
    queryFn: async ({ pageParam }) =>
      (await getApiClient().module.moduleVersionControllerSearchVersions({ ...queryParams, page: pageParam as number }))
        .data,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => getNextPage(lastPage.meta),
    placeholderData: keepPreviousData,
  });

export const moduleVersionQueryOptions = (versionId: string) =>
  queryOptions<ModuleVersionOutputDTO, AxiosError<ModuleVersionOutputDTO>>({
    queryKey: moduleKeys.versions.detail(versionId),
    queryFn: async () => (await getApiClient().module.moduleVersionControllerGetModuleVersion(versionId)).data.data,
  });

export const useModuleCreate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<ModuleOutputDTO, ModuleCreateAPIDTO>(
    useMutation<ModuleOutputDTO, AxiosError<ModuleOutputDTOAPI>, ModuleCreateAPIDTO>({
      mutationFn: async (moduleCreateDTO: ModuleCreateAPIDTO) =>
        (await apiClient.module.moduleControllerCreate(moduleCreateDTO)).data.data,

      onSuccess: async (newModule: ModuleOutputDTO) => {
        enqueueSnackbar('Module created!', { variant: 'default', type: 'success' });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });

        queryClient.setQueryData<ModuleVersionOutputDTO>(
          moduleKeys.versions.detail(newModule.latestVersion.id),
          newModule.latestVersion,
        );

        const currentModuleCount = queryClient.getQueryData<number>(moduleKeys.count());
        if (currentModuleCount) {
          queryClient.setQueryData<number>(moduleKeys.count(), currentModuleCount + 1);
        }
        return queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(newModule.id), newModule);
      },
    }),
    defaultModuleErrorMessages,
  );
};

interface TagModule {
  moduleId: string;
  tag: string;
}

export const useTagModule = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<ModuleVersionOutputDTO, TagModule>(
    useMutation<ModuleVersionOutputDTO, AxiosError<ModuleVersionOutputDTO>, TagModule>({
      mutationFn: async ({ tag, moduleId }) =>
        (await apiClient.module.moduleVersionControllerTagVersion({ tag, moduleId })).data.data,
      onSuccess: async (newVersion: ModuleVersionOutputDTO, { moduleId }) => {
        enqueueSnackbar(`Module tagged with version: ${newVersion.tag}!`, { variant: 'default', type: 'success' });

        // We don't need to change anything the latest version, since it will still match the latest version.
        queryClient.setQueryData<ModuleVersionOutputDTO>(moduleKeys.versions.detail(newVersion.id), newVersion);

        // We get rid of moduleDetail, we would have to update the small versions (change tags)
        await queryClient.invalidateQueries({ queryKey: moduleKeys.detail(moduleId) });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
      },
    }),
    {},
  );
};

interface ModuleRemove {
  moduleId: string;
}

export const useModuleRemove = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<APIOutput, ModuleRemove>(
    useMutation<APIOutput, AxiosError<APIOutput>, ModuleRemove>({
      mutationFn: async ({ moduleId }) => (await apiClient.module.moduleControllerRemove(moduleId)).data,
      onSuccess: async (_, { moduleId }) => {
        enqueueSnackbar('Module successfully deleted!', { variant: 'default', type: 'success' });

        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
        queryClient.removeQueries({ queryKey: moduleKeys.versions.list(moduleId) });
        queryClient.removeQueries({ queryKey: moduleKeys.detail(moduleId) });

        const currentModuleCount = queryClient.getQueryData<number>(moduleKeys.count());
        if (currentModuleCount) {
          queryClient.setQueryData<number>(moduleKeys.count(), currentModuleCount - 1);
        }
      },
    }),
    {},
  );
};

interface ModuleExportInput {
  moduleId: string;
  options: ModuleExportOptionsDTO;
}
export const useModuleExport = () => {
  return mutationWrapper<ModuleTransferDTO, ModuleExportInput>(
    useMutation<ModuleTransferDTO, AxiosError<ModuleTransferDTO>, ModuleExportInput>({
      mutationFn: async ({ moduleId, options }) =>
        (await getApiClient().module.moduleControllerExport(moduleId, options)).data.data,
    }),
    {},
  );
};

export const useModuleImport = () => {
  const apiClient = getApiClient();

  return mutationWrapper<void, ModuleTransferDTO>(
    useMutation<AxiosResponse<void>, AxiosError<void>, ModuleTransferDTO>({
      mutationFn: async (mod) => await apiClient.module.moduleControllerImport(mod),
      onSuccess: async (_) => {
        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
      },
    }),
    {},
  );
};

interface ModuleUpdate {
  moduleUpdate: ModuleUpdateDTO;
  id: string;
}
export const useModuleUpdate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<ModuleOutputDTO, ModuleUpdate>(
    useMutation<ModuleOutputDTO, AxiosError<ModuleOutputDTOAPI>, ModuleUpdate>({
      mutationFn: async ({ id, moduleUpdate }) =>
        (await apiClient.module.moduleControllerUpdate(id, moduleUpdate)).data.data,
      onSuccess: async (updatedModule: ModuleOutputDTO) => {
        enqueueSnackbar('Module updated!', { variant: 'default', type: 'success' });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });

        queryClient.setQueryData<ModuleVersionOutputDTO>(
          moduleKeys.versions.detail(updatedModule.latestVersion.id),
          updatedModule.latestVersion,
        );

        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(updatedModule.id), updatedModule);
      },
    }),
    defaultModuleErrorMessages,
  );
};

// ==================================
//              hooks
// ==================================
export const hookQueryOptions = (hookId: string) =>
  queryOptions<HookOutputDTO, AxiosError<HookOutputDTOAPI>>({
    queryKey: moduleKeys.hooks.detail(hookId),
    queryFn: async () => (await getApiClient().hook.hookControllerGetOne(hookId)).data.data,
  });

interface HookCreate {
  hook: HookCreateDTO;
  moduleId: string;
  versionId: string;
}

export const useHookCreate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<HookOutputDTO, HookCreate>(
    useMutation<HookOutputDTO, AxiosError<HookOutputDTOAPI>, HookCreate>({
      mutationFn: async ({ hook }) => (await apiClient.hook.hookControllerCreate(hook)).data.data,
      onSuccess: async (newHook: HookOutputDTO, { moduleId, versionId }): Promise<void> => {
        enqueueSnackbar('Hook created!', { variant: 'default', type: 'success' });

        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.hooks.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(newHook.versionId) });

        // TODO: Here we somehow need to get the moduleId, so we can update the cache of the specific moduleOutputDTO
        // we really need the moduleId, otherwise need to invalidate all moduleIds

        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(moduleId), (prev) =>
          prev
            ? {
                ...prev,
                latestVersion: {
                  ...prev.latestVersion,
                  hooks: prev.latestVersion.hooks.concat(newHook),
                },
              }
            : undefined,
        );

        queryClient.setQueryData<ModuleVersionOutputDTO>(moduleKeys.versions.detail(versionId), (prev) =>
          prev
            ? {
                ...prev,
                hooks: [...prev.hooks, newHook],
              }
            : undefined,
        );
        queryClient.setQueryData(moduleKeys.hooks.detail(newHook.id), newHook);
      },
    }),
    defaultHookErrorMessages,
  );
};

interface HookRemove {
  hookId: string;
  versionId: string;
  moduleId: string;
}

export const useHookRemove = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<APIOutput, HookRemove>(
    useMutation<APIOutput, AxiosError<APIOutput>, HookRemove>({
      mutationFn: async ({ hookId }) => (await apiClient.hook.hookControllerRemove(hookId)).data,
      onSuccess: async (_, { hookId, versionId, moduleId }) => {
        enqueueSnackbar('Hook successfully deleted!', { variant: 'default', type: 'success' });

        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.hooks.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(versionId) });
        queryClient.removeQueries({ queryKey: moduleKeys.hooks.detail(hookId) });

        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(moduleId), (prev) =>
          prev
            ? {
                ...prev,
                latestVersion: {
                  ...prev.latestVersion,
                  hooks: prev.latestVersion.hooks.filter((hook) => hook.id !== hookId),
                },
              }
            : undefined,
        );

        queryClient.setQueryData<ModuleVersionOutputDTO>(moduleKeys.versions.detail(versionId), (prev) =>
          prev
            ? {
                ...prev,
                hooks: prev.hooks.filter((hook) => hook.id !== hookId),
              }
            : undefined,
        );
      },
    }),
    defaultHookErrorMessages,
  );
};

interface HookUpdate {
  hookId: string;
  moduleId: string;
  versionId: string;
  hook: HookUpdateDTO;
}
export const useHookUpdate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<HookOutputDTO, HookUpdate>(
    useMutation<HookOutputDTO, AxiosError<HookOutputDTOAPI>, HookUpdate>({
      mutationFn: async ({ hookId, hook }) => (await apiClient.hook.hookControllerUpdate(hookId, hook)).data.data,
      onSuccess: async (updatedHook: HookOutputDTO, { hookId, moduleId, versionId }) => {
        enqueueSnackbar('Hook updated!', { variant: 'default', type: 'success' });

        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.hooks.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(updatedHook.versionId) });
        queryClient.setQueryData<HookOutputDTO>(moduleKeys.hooks.detail(hookId), updatedHook);

        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(moduleId), (prev) =>
          prev
            ? {
                ...prev,
                latestVersion: {
                  ...prev.latestVersion,
                  hooks: prev.latestVersion.hooks.map((h) => (h.id === updatedHook.id ? updatedHook : h)),
                },
              }
            : undefined,
        );

        queryClient.setQueryData<ModuleVersionOutputDTO>(moduleKeys.versions.detail(versionId), (prev) => {
          if (!prev) {
            return prev;
          }
          return {
            ...prev,
            hooks: prev.hooks.map((h) => (h.id === updatedHook.id ? updatedHook : h)),
          };
        });
      },
    }),
    defaultHookErrorMessages,
  );
};

// ==================================
//              commands
// ==================================

export const commandQueryOptions = (commandId: string) =>
  queryOptions<CommandOutputDTO, AxiosError<CommandOutputDTOAPI>>({
    queryKey: moduleKeys.commands.detail(commandId),
    queryFn: async () => (await getApiClient().command.commandControllerGetOne(commandId)).data.data,
  });

interface CommandCreate {
  command: CommandCreateDTO;
  versionId: string;
  moduleId: string;
}

export const useCommandCreate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<CommandOutputDTO, CommandCreate>(
    useMutation<CommandOutputDTO, AxiosError<CommandOutputDTOAPI>, CommandCreate>({
      mutationFn: async ({ command }) => (await apiClient.command.commandControllerCreate(command)).data.data,
      onSuccess: async (newCommand: CommandOutputDTO, { moduleId, versionId }) => {
        enqueueSnackbar('Command created!', { variant: 'default', type: 'success' });

        // TODO: somehow need the moduleId, so we can update the latest version part of that specific module.
        // atm we can also not clear the cache of the specific moduleOutputDTO.

        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.commands.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(versionId) });

        queryClient.setQueryData<CommandOutputDTO>(moduleKeys.commands.detail(newCommand.id), newCommand);

        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(moduleId), (prev) =>
          prev
            ? {
                ...prev,
                latestVersion: {
                  ...prev.latestVersion,
                  commands: prev.latestVersion.commands.concat(newCommand),
                },
              }
            : undefined,
        );
        queryClient.setQueryData<ModuleVersionOutputDTO>(moduleKeys.versions.detail(versionId), (prev) =>
          prev
            ? {
                ...prev,
                commands: prev.commands.concat(newCommand),
              }
            : undefined,
        );
      },
    }),
    defaultCommandErrorMessages,
  );
};

interface CommandUpdate {
  command: CommandUpdateDTO;
  versionId: string;
  moduleId: string;
  commandId: string;
}
export const useCommandUpdate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<CommandOutputDTO, CommandUpdate>(
    useMutation<CommandOutputDTO, AxiosError<CommandOutputDTOAPI>, CommandUpdate>({
      mutationFn: async ({ commandId, command }) =>
        (await apiClient.command.commandControllerUpdate(commandId, command)).data.data,
      onSuccess: async (updatedCommand: CommandOutputDTO, { versionId, moduleId }) => {
        enqueueSnackbar('Command updated!', { variant: 'default', type: 'success' });

        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.commands.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(updatedCommand.versionId) });

        queryClient.setQueryData<CommandOutputDTO>(moduleKeys.commands.detail(updatedCommand.id), updatedCommand);
        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(moduleId), (prev) =>
          prev
            ? {
                ...prev,
                latestVersion: {
                  ...prev.latestVersion,
                  commands: prev.latestVersion.commands.map((c) => (c.id === updatedCommand.id ? updatedCommand : c)),
                },
              }
            : undefined,
        );

        queryClient.setQueryData<ModuleVersionOutputDTO>(moduleKeys.versions.detail(versionId), (prev) =>
          prev
            ? {
                ...prev,
                commands: prev.commands.map((c) => (c.id === updatedCommand.id ? updatedCommand : c)),
              }
            : undefined,
        );

        return;
      },
    }),
    defaultCommandErrorMessages,
  );
};

interface CommandRemove {
  commandId: string;
  versionId: string;
  moduleId: string;
}

export const useCommandRemove = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<APIOutput, CommandRemove>(
    useMutation<APIOutput, AxiosError<APIOutput>, CommandRemove>({
      mutationFn: async ({ commandId }) => (await apiClient.command.commandControllerRemove(commandId)).data,
      onSuccess: async (_, { commandId, versionId, moduleId }) => {
        enqueueSnackbar('Command successfully deleted!', { variant: 'default', type: 'success' });
        // invalidate list of commands
        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.commands.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(versionId) });
        queryClient.removeQueries({ queryKey: moduleKeys.commands.detail(commandId) });

        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(moduleId), (prev) =>
          prev
            ? {
                ...prev,
                latestVersion: {
                  ...prev.latestVersion,
                  commands: prev.latestVersion.commands.filter((command) => command.id !== commandId),
                },
              }
            : undefined,
        );

        // TODO: need to invalidate the query of the specific module
        queryClient.setQueryData<ModuleVersionOutputDTO>(moduleKeys.versions.detail(versionId), (prev) =>
          prev
            ? {
                ...prev,
                commands: prev.commands.filter((command) => command.id !== commandId),
              }
            : undefined,
        );
      },
    }),
    defaultCommandErrorMessages,
  );
};

// ==================================
//              cronjobs
// ==================================
export const cronjobQueryOptions = (cronjobId: string) =>
  queryOptions<CronJobOutputDTO, AxiosError<CronJobOutputDTOAPI>>({
    queryKey: moduleKeys.cronJobs.detail(cronjobId),
    queryFn: async () => (await getApiClient().cronjob.cronJobControllerGetOne(cronjobId)).data.data,
  });

interface CronJobCreate {
  cronJob: CronJobCreateDTO;
  moduleId: string;
  versionId: string;
}

export const useCronJobCreate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<CronJobOutputDTO, CronJobCreate>(
    useMutation<CronJobOutputDTO, AxiosError<CronJobOutputDTOAPI>, CronJobCreate>({
      mutationFn: async ({ cronJob }: CronJobCreate) =>
        (await apiClient.cronjob.cronJobControllerCreate(cronJob)).data.data,
      onSuccess: async (newCronJob: CronJobOutputDTO, { moduleId, versionId }) => {
        enqueueSnackbar('Cronjob created!', { variant: 'default', type: 'success' });

        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.cronJobs.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(newCronJob.versionId) });

        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(moduleId), (prev) =>
          prev
            ? {
                ...prev,
                latestVersion: {
                  ...prev.latestVersion,
                  cronJobs: [...prev.latestVersion.cronJobs, newCronJob],
                },
              }
            : undefined,
        );

        queryClient.setQueryData<ModuleVersionOutputDTO>(moduleKeys.versions.detail(versionId), (prev) =>
          prev
            ? {
                ...prev,
                cronJobs: [...prev.cronJobs, newCronJob],
              }
            : undefined,
        );

        return queryClient.setQueryData<CronJobOutputDTO>(moduleKeys.cronJobs.detail(newCronJob.id), newCronJob);
      },
    }),
    defaultCronJobErrorMessages,
  );
};

interface CronJobUpdate {
  cronJobId: string;
  cronJob: CronJobUpdateDTO;
  moduleId: string;
  versionId: string;
}
export const useCronJobUpdate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<CronJobOutputDTO, CronJobUpdate>(
    useMutation<CronJobOutputDTO, AxiosError<CronJobOutputDTOAPI>, CronJobUpdate>({
      mutationFn: async ({ cronJobId, cronJob }) =>
        (await apiClient.cronjob.cronJobControllerUpdate(cronJobId, cronJob)).data.data,
      onSuccess: async (updatedCronJob: CronJobOutputDTO, { moduleId }) => {
        enqueueSnackbar('Cronjob updated!', { variant: 'default', type: 'success' });

        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.cronJobs.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(updatedCronJob.versionId) });

        queryClient.setQueryData<CronJobOutputDTO>(moduleKeys.cronJobs.detail(updatedCronJob.id), updatedCronJob);

        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(moduleId), (prev) =>
          prev
            ? {
                ...prev,
                latestVersion: {
                  ...prev.latestVersion,
                  cronJobs: prev.latestVersion.cronJobs.map((c) => (c.id === updatedCronJob.id ? updatedCronJob : c)),
                },
              }
            : undefined,
        );
        queryClient.setQueryData<ModuleVersionOutputDTO>(
          moduleKeys.versions.detail(updatedCronJob.versionId),
          (prev) =>
            prev
              ? {
                  ...prev,
                  cronJobs: prev.cronJobs.map((c) => (c.id === updatedCronJob.id ? updatedCronJob : c)),
                }
              : undefined,
        );
      },
    }),
    defaultCronJobErrorMessages,
  );
};

interface CronJobRemove {
  cronJobId: string;
  moduleId: string;
  versionId: string;
}

export const useCronJobRemove = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<APIOutput, CronJobRemove>(
    useMutation<APIOutput, AxiosError<APIOutput>, CronJobRemove>({
      mutationFn: async ({ cronJobId }: { cronJobId: string }) =>
        (await apiClient.cronjob.cronJobControllerRemove(cronJobId)).data,
      onSuccess: async (_, { cronJobId, versionId }) => {
        enqueueSnackbar('Cronjob successfully deleted!', { variant: 'default', type: 'success' });

        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.cronJobs.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(versionId) });

        queryClient.removeQueries({ queryKey: moduleKeys.cronJobs.detail(cronJobId) });

        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(versionId), (prev) =>
          prev
            ? {
                ...prev,
                latestVersion: {
                  ...prev.latestVersion,
                  cronJobs: prev.latestVersion.cronJobs.filter((cronJob) => cronJob.id !== cronJobId),
                },
              }
            : undefined,
        );

        queryClient.setQueryData<ModuleVersionOutputDTO>(moduleKeys.versions.detail(versionId), (prev) =>
          prev
            ? {
                ...prev,
                cronJobs: prev.cronJobs.filter((cronJob) => cronJob.id !== cronJobId),
              }
            : undefined,
        );
      },
    }),
    defaultCronJobErrorMessages,
  );
};

// ==================================
//              functions
// IMPORTANT: Only use function CRUD when you are not dealing with a cronjob, command or hook.
// Otherwise cache will not be updated properly.
// ==================================

export const functionQueryOptions = (functionId: string) =>
  queryOptions<FunctionOutputDTO, AxiosError<FunctionOutputDTOAPI>>({
    queryKey: moduleKeys.functions.detail(functionId),
    queryFn: async () => (await getApiClient().function.functionControllerGetOne(functionId)).data.data,
  });

interface FunctionCreate {
  fn: FunctionCreateDTO;
  versionId: string;
  moduleId: string;
}

export const useFunctionCreate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<FunctionOutputDTO, FunctionCreate>(
    useMutation<FunctionOutputDTO, AxiosError<FunctionOutputDTOAPI>, FunctionCreate>({
      mutationFn: async ({ fn }) => (await apiClient.function.functionControllerCreate(fn)).data.data,
      onSuccess: async (newFn: FunctionOutputDTO, { moduleId, versionId }) => {
        // invalidate list of functions
        await queryClient.invalidateQueries({ queryKey: moduleKeys.functions.list() });

        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(moduleId), (prev) => {
          if (!prev) {
            return prev;
          }
          return {
            ...prev,
            latestVersion: {
              ...prev.latestVersion,
              functions: prev.latestVersion.functions.concat(newFn),
            },
          };
        });

        queryClient.setQueryData<ModuleVersionOutputDTO>(moduleKeys.versions.detail(versionId), (prev) => {
          if (!prev) {
            return prev;
          }
          return {
            ...prev,
            functions: prev.functions.concat(newFn),
          };
        });

        return queryClient.setQueryData<FunctionOutputDTO>(moduleKeys.functions.detail(newFn.id), newFn);
      },
    }),
    defaultFunctionErrorMessages,
  );
};

interface FunctionUpdate {
  functionId: string;
  fn: FunctionUpdateDTO;
  moduleId: string;
  versionId: string;
}
export const useFunctionUpdate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<FunctionOutputDTO, FunctionUpdate>(
    useMutation<FunctionOutputDTO, AxiosError<FunctionOutputDTOAPI>, FunctionUpdate>({
      mutationFn: async ({ functionId, fn }) =>
        (await apiClient.function.functionControllerUpdate(functionId, fn)).data.data,
      onSuccess: async (updatedFn: FunctionOutputDTO, { functionId, moduleId, versionId }) => {
        // invalidate list of functions
        await queryClient.invalidateQueries({ queryKey: moduleKeys.functions.list() });

        queryClient.setQueryData<FunctionOutputDTO>(moduleKeys.functions.detail(functionId), updatedFn);
        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(moduleId), (prev) => {
          if (prev) {
            return {
              ...prev,
              latestVersion: {
                ...prev.latestVersion,
                functions: prev.latestVersion.functions.map((f) => (f.id === updatedFn.id ? updatedFn : f)),
              },
            };
          }
        });
        queryClient.setQueryData<ModuleVersionOutputDTO>(moduleKeys.versions.detail(versionId), (prev) => {
          if (prev) {
            return {
              ...prev,
              functions: prev.functions.map((f) => (f.id === updatedFn.id ? updatedFn : f)),
            };
          }
        });
      },
    }),
    defaultFunctionErrorMessages,
  );
};

interface FunctionRemove {
  moduleId: string;
  functionId: string;
  versionId: string;
}

export const useFunctionRemove = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<APIOutput, FunctionRemove>(
    useMutation<APIOutput, AxiosError<APIOutput>, FunctionRemove>({
      mutationFn: async ({ functionId }) => (await apiClient.function.functionControllerRemove(functionId)).data,
      onSuccess: async (_, { functionId, moduleId, versionId }) => {
        await queryClient.invalidateQueries({ queryKey: moduleKeys.functions.list() });
        queryClient.removeQueries({ queryKey: moduleKeys.functions.detail(functionId) });

        // Remove function from module latestVersion's function cache
        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(moduleId), (prev) => {
          if (prev) {
            return {
              ...prev,
              latestVersion: {
                ...prev.latestVersion,
                functions: prev.latestVersion.functions.filter((func) => func.id !== functionId),
              },
            };
          }
        });

        // Remove function from specific module version's function cache
        queryClient.setQueryData<ModuleVersionOutputDTO>(moduleKeys.versions.detail(versionId), (prev) => {
          if (prev) {
            return {
              ...prev,
              functions: prev.functions.filter((func) => func.id !== functionId),
            };
          }
          return undefined;
        });
      },
    }),
    defaultFunctionErrorMessages,
  );
};
