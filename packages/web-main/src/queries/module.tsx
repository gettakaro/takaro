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
  ModuleExportDTOAPI,
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
  version: (versionId: string) => [...moduleKeys.all, 'version', versionId] as const,
  export: (versionId: string) => [...moduleKeys.all, 'export', versionId] as const,
  list: () => [...moduleKeys.all, 'list'] as const,
  versionList: () => [...moduleKeys.all, 'versionList'] as const,

  hooks: {
    all: ['hooks'] as const,
    list: () => [...moduleKeys.hooks.all, 'list'] as const,
    detail: (id: string) => [...moduleKeys.hooks.all, 'detail', id] as const,
  },
  commands: {
    all: ['commands'] as const,
    list: () => [...moduleKeys.commands.all, 'list'] as const,
    detail: (moduleId: string) => [...moduleKeys.commands.all, 'detail', moduleId] as const,
  },
  cronJobs: {
    all: ['cronjobs'] as const,
    list: () => [...moduleKeys.cronJobs.all, 'list'] as const,
    detail: (moduleId: string) => [...moduleKeys.cronJobs.all, 'detail', moduleId] as const,
  },
  functions: {
    all: ['functions'] as const,
    list: () => [...moduleKeys.functions.all, 'list'] as const,
    detail: (moduleId: string) => [...moduleKeys.functions.all, 'detail', moduleId] as const,
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

export const moduleVersionsQueryOptions = (queryParams: ModuleVersionSearchInputDTO) =>
  queryOptions<ModuleVersionOutputArrayDTOAPI, AxiosError<ModuleOutputArrayDTOAPI>>({
    queryKey: [...moduleKeys.versionList(), ...queryParamsToArray(queryParams)],
    queryFn: async ({ }) => (await getApiClient().module.moduleVersionControllerSearchVersions(queryParams)).data,
  });

export const moduleVersionsInfiniteQueryOptions = (queryParams: ModuleVersionSearchInputDTO = {}) =>
  infiniteQueryOptions<ModuleVersionOutputArrayDTOAPI, AxiosError<ModuleVersionOutputArrayDTOAPI>>({
    queryKey: [...moduleKeys.versionList(), 'infinite', ...queryParamsToArray(queryParams)],
    queryFn: async ({ pageParam }) =>
      (await getApiClient().module.moduleVersionControllerSearchVersions({ ...queryParams, page: pageParam as number }))
        .data,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => getNextPage(lastPage.meta),
    placeholderData: keepPreviousData,
  });

export const moduleVersionQueryOptions = (versionId: string) =>
  queryOptions<ModuleVersionOutputDTO, AxiosError<ModuleVersionOutputDTO>>({
    queryKey: moduleKeys.version(versionId),
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
          moduleKeys.version(newModule.latestVersion.id),
          newModule.latestVersion,
        );

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
        queryClient.setQueryData<ModuleVersionOutputDTO>(moduleKeys.version(newVersion.id), newVersion);

        // We get rid of moduleDetail, we would have to update the small versions (change tags)
        // and the latest version.
        await queryClient.invalidateQueries({ queryKey: moduleKeys.detail(moduleId) });
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

        const removedModule = queryClient.getQueryData<ModuleOutputDTO>(moduleKeys.detail(moduleId));

        // remove all versions of the module
        if (removedModule) {
          removedModule.versions.forEach((version) => {
            queryClient.removeQueries({ queryKey: moduleKeys.version(version.id) });
            //queryClient.removeQueries({ queryKey: moduleKeys.export(version.id) });
          });
        }

        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
        queryClient.removeQueries({ queryKey: moduleKeys.detail(moduleId) });
      },
    }),
    {},
  );
};

interface ModuleExportInput {
  moduleId: string;
  options: ModuleExportOptionsDTO;
}
export const exportedModuleOptions = () => {
  return mutationWrapper<ModuleTransferDTO, ModuleExportInput>(
    useMutation<ModuleExportDTOAPI, AxiosError<ModuleTransferDTO>, ModuleExportInput>({
      mutationFn: async ({ moduleId, options }) =>
        (await getApiClient().module.moduleControllerExport(moduleId, options)).data,
    }),
    {},
  );
};

export const useModuleImport = () => {
  const apiClient = getApiClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<void, ModuleTransferDTO>(
    useMutation<AxiosResponse<void>, AxiosError<void>, ModuleTransferDTO>({
      mutationFn: async (mod) => await apiClient.module.moduleControllerImport(mod),
      onSuccess: async (_, mod) => {
        enqueueSnackbar(`Module ${mod.name} imported!`, { variant: 'default', type: 'success' });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
      },
    }),
    {},
  );
};

// TODO: add a module version update mututation
// TODO: update export module version, import module version
// todo: update a version
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

        console.log('updated module', updatedModule);
        // TODO: depends on what export does now;
        // await queryClient.invalidateQueries({ queryKey: moduleKeys.export(updatedModule.) });

        queryClient.setQueryData<ModuleVersionOutputDTO>(
          moduleKeys.version(updatedModule.latestVersion.id),
          updatedModule.latestVersion,
        );

        console.log('version', queryClient.getQueryData(moduleKeys.version(updatedModule.latestVersion.id)));
        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(updatedModule.id), updatedModule);

        console.log('module', queryClient.getQueryData(moduleKeys.detail(updatedModule.id)));
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

export const useHookCreate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<HookOutputDTO, HookCreateDTO>(
    useMutation<HookOutputDTO, AxiosError<HookOutputDTOAPI>, HookCreateDTO>({
      mutationFn: async (hook) => (await apiClient.hook.hookControllerCreate(hook)).data.data,
      onSuccess: async (newHook: HookOutputDTO): Promise<void> => {
        enqueueSnackbar('Hook created!', { variant: 'default', type: 'success' });

        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.hooks.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(newHook.versionId) });

        // TODO: Here we somehow need to get the moduleId, so we can update the cache of the specific moduleOutputDTO
        // we really need the moduleId, otherwise need to invalidate all moduleIds

        queryClient.setQueryData<ModuleVersionOutputDTO>(moduleKeys.version(newHook.versionId), (prev) =>
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
}

export const useHookRemove = ({ versionId }) => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<APIOutput, HookRemove>(
    useMutation<APIOutput, AxiosError<APIOutput>, HookRemove>({
      mutationFn: async ({ hookId }) => (await apiClient.hook.hookControllerRemove(hookId)).data,
      onSuccess: async (_, { hookId }) => {
        enqueueSnackbar('Hook successfully deleted!', { variant: 'default', type: 'success' });

        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.hooks.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(versionId) });

        // TODO: need to update the cache of the specific ModuleVersionOutputDTO

        queryClient.removeQueries({ queryKey: moduleKeys.hooks.detail(hookId) });
        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.version(versionId), (prev) =>
          prev
            ? {
              ...prev,
              hooks: prev.latestVersion.hooks.filter((hook) => hook.id !== hookId),
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
  hook: HookUpdateDTO;
}
export const useHookUpdate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<HookOutputDTO, HookUpdate>(
    useMutation<HookOutputDTO, AxiosError<HookOutputDTOAPI>, HookUpdate>({
      mutationFn: async ({ hookId, hook }) => (await apiClient.hook.hookControllerUpdate(hookId, hook)).data.data,
      onSuccess: async (updatedHook: HookOutputDTO) => {
        enqueueSnackbar('Hook updated!', { variant: 'default', type: 'success' });

        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.hooks.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(updatedHook.versionId) });

        // TODO: somehow need the moduleId, so we can update the latest version part of that specific module.
        // atm we can also not clear the cache of the specific moduleOutputDTO.

        queryClient.setQueryData<HookOutputDTO>(moduleKeys.hooks.detail(updatedHook.id), updatedHook);
        queryClient.setQueryData<ModuleVersionOutputDTO>(moduleKeys.version(updatedHook.versionId), (prev) => {
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

export const useCommandCreate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<CommandOutputDTO, CommandCreateDTO>(
    useMutation<CommandOutputDTO, AxiosError<CommandOutputDTOAPI>, CommandCreateDTO>({
      mutationFn: async (command) => (await apiClient.command.commandControllerCreate(command)).data.data,
      onSuccess: async (newCommand: CommandOutputDTO) => {
        enqueueSnackbar('Command created!', { variant: 'default', type: 'success' });

        // TODO: somehow need the moduleId, so we can update the latest version part of that specific module.
        // atm we can also not clear the cache of the specific moduleOutputDTO.

        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.commands.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(newCommand.versionId) });

        queryClient.setQueryData<CommandOutputDTO>(moduleKeys.commands.detail(newCommand.id), newCommand);
        queryClient.setQueryData<ModuleVersionOutputDTO>(moduleKeys.detail(newCommand.versionId), (prev) =>
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
  commandId: string;
  command: CommandUpdateDTO;
}
export const useCommandUpdate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<CommandOutputDTO, CommandUpdate>(
    useMutation<CommandOutputDTO, AxiosError<CommandOutputDTOAPI>, CommandUpdate>({
      mutationFn: async ({ commandId, command }) =>
        (await apiClient.command.commandControllerUpdate(commandId, command)).data.data,
      onSuccess: async (updatedCommand: CommandOutputDTO) => {
        enqueueSnackbar('Command updated!', { variant: 'default', type: 'success' });

        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.commands.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(updatedCommand.versionId) });

        // todo: need to update the cache of the specific ModuleVersionOutputDTO

        queryClient.setQueryData<ModuleVersionOutputDTO>(moduleKeys.detail(updatedCommand.versionId), (prev) =>
          prev
            ? {
              ...prev,
              commands: prev.commands.map((c) => (c.id === updatedCommand.id ? updatedCommand : c)),
            }
            : undefined,
        );

        return queryClient.invalidateQueries({ queryKey: moduleKeys.commands.detail(updatedCommand.id) });
        // TODO: Test this again when: https://github.com/gettakaro/takaro/issues/1811 is fixed.
        // We probably also want to add a test to that.
        //return queryClient.setQueryData<CommandOutputDTO>(
        //  moduleKeys.commands.detail(updatedCommand.id),
        //  updatedCommand,
        //);
      },
    }),
    defaultCommandErrorMessages,
  );
};

interface CommandRemove {
  commandId: string;
}

export const useCommandRemove = ({ versionId }) => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<APIOutput, CommandRemove>(
    useMutation<APIOutput, AxiosError<APIOutput>, CommandRemove>({
      mutationFn: async ({ commandId }) => (await apiClient.command.commandControllerRemove(commandId)).data,
      onSuccess: async (_, { commandId }) => {
        enqueueSnackbar('Command successfully deleted!', { variant: 'default', type: 'success' });
        // invalidate list of commands
        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.commands.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(versionId) });

        // TODO: need to invalidate the query of the specific module
        queryClient.removeQueries({ queryKey: moduleKeys.commands.detail(commandId) });
        queryClient.setQueryData<ModuleVersionOutputDTO>(moduleKeys.version(versionId), (prev) =>
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

export const useCronJobCreate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<CronJobOutputDTO, CronJobCreateDTO>(
    useMutation<CronJobOutputDTO, AxiosError<CronJobOutputDTOAPI>, CronJobCreateDTO>({
      mutationFn: async (cronjob: CronJobCreateDTO) =>
        (await apiClient.cronjob.cronJobControllerCreate(cronjob)).data.data,
      onSuccess: async (newCronJob: CronJobOutputDTO) => {
        enqueueSnackbar('Cronjob created!', { variant: 'default', type: 'success' });

        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.cronJobs.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(newCronJob.versionId) });
        queryClient.setQueryData<ModuleVersionOutputDTO>(moduleKeys.version(newCronJob.versionId), (prev) =>
          prev
            ? {
              ...prev,
              cronJobs: [...prev.cronJobs, newCronJob],
            }
            : undefined,
        );

        // add cache entry for new cronjob
        return queryClient.setQueryData<CronJobOutputDTO>(moduleKeys.cronJobs.detail(newCronJob.id), newCronJob);
      },
    }),
    defaultCronJobErrorMessages,
  );
};

interface CronJobUpdate {
  cronJobId: string;
  cronJob: CronJobUpdateDTO;
}
export const useCronJobUpdate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<CronJobOutputDTO, CronJobUpdate>(
    useMutation<CronJobOutputDTO, AxiosError<CronJobOutputDTOAPI>, CronJobUpdate>({
      mutationFn: async ({ cronJobId, cronJob }) =>
        (await apiClient.cronjob.cronJobControllerUpdate(cronJobId, cronJob)).data.data,
      onSuccess: async (updatedCronJob: CronJobOutputDTO) => {
        enqueueSnackbar('Cronjob updated!', { variant: 'default', type: 'success' });

        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.cronJobs.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(updatedCronJob.versionId) });

        queryClient.setQueryData<CronJobOutputDTO>(moduleKeys.cronJobs.detail(updatedCronJob.id), updatedCronJob);
        queryClient.setQueryData<ModuleVersionOutputDTO>(moduleKeys.version(updatedCronJob.versionId), (prev) =>
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

        // TODO: Remove cronjob from module latestVersion's cronjob's cache

        queryClient.removeQueries({ queryKey: moduleKeys.cronJobs.detail(cronJobId) });
        queryClient.setQueryData<ModuleVersionOutputDTO>(moduleKeys.version(versionId), (prev) =>
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
  moduleId: string;
}

export const useFunctionCreate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<FunctionOutputDTO, FunctionCreate>(
    useMutation<FunctionOutputDTO, AxiosError<FunctionOutputDTOAPI>, FunctionCreate>({
      mutationFn: async ({ fn }) => (await apiClient.function.functionControllerCreate(fn)).data.data,
      onSuccess: async (newFn: FunctionOutputDTO, { moduleId }) => {
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

        // add cache entry for new function
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
}
export const useFunctionUpdate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<FunctionOutputDTO, FunctionUpdate>(
    useMutation<FunctionOutputDTO, AxiosError<FunctionOutputDTOAPI>, FunctionUpdate>({
      mutationFn: async ({ functionId, fn }) =>
        (await apiClient.function.functionControllerUpdate(functionId, fn)).data.data,
      onSuccess: async (updatedFn: FunctionOutputDTO, { moduleId }) => {
        // invalidate list of functions
        await queryClient.invalidateQueries({ queryKey: moduleKeys.functions.list() });

        queryClient.setQueryData<FunctionOutputDTO>(moduleKeys.functions.detail(updatedFn.id), updatedFn);
        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(moduleId), (prev) => {
          if (prev) {
            return {
              ...prev,
              functions: prev.latestVersion.functions.map((f) => (f.id === updatedFn.id ? updatedFn : f)),
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
}

export const useFunctionRemove = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<APIOutput, FunctionRemove>(
    useMutation<APIOutput, AxiosError<APIOutput>, FunctionRemove>({
      mutationFn: async ({ functionId }) => (await apiClient.function.functionControllerRemove(functionId)).data,
      onSuccess: async (_, { functionId, moduleId }) => {
        await queryClient.invalidateQueries({ queryKey: moduleKeys.functions.list() });

        // Remove function from module latestVersion's function's cache
        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(moduleId), (prev) => {
          if (prev) {
            return {
              ...prev,
              functions: prev.latestVersion.functions.filter((func) => func.id !== functionId),
            };
          }
        });

        queryClient.removeQueries({ queryKey: moduleKeys.functions.detail(functionId) });
      },
    }),
    defaultFunctionErrorMessages,
  );
};
