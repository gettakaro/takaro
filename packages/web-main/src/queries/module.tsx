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
  BuiltinModule,
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
  ModuleOutputArrayDTOAPI,
  ModuleOutputDTO,
  ModuleOutputDTOAPI,
  ModuleSearchInputDTO,
  ModuleUpdateDTO,
} from '@takaro/apiclient';

import { queryParamsToArray, getNextPage, mutationWrapper } from './util';
import { AxiosError, AxiosResponse } from 'axios';
import { ErrorMessageMapping } from '@takaro/lib-components/src/errors';
import { queryClient } from 'queryClient';
import { useSnackbar } from 'notistack';

export const moduleKeys = {
  all: ['modules'] as const,
  detail: (id: string) => [...moduleKeys.all, 'detail', id] as const,
  export: (id: string) => [...moduleKeys.all, 'export', id] as const,
  list: () => [...moduleKeys.all, 'list'] as const,

  hooks: {
    all: ['hooks'] as const,
    list: () => [...moduleKeys.hooks.all, 'list'] as const,
    detail: (id: string) => [...moduleKeys.hooks.all, 'detail', id] as const,
  },
  commands: {
    all: ['commands'] as const,
    list: () => [...moduleKeys.commands.all, 'list'] as const,
    detail: (id: string) => [...moduleKeys.commands.all, 'detail', id] as const,
  },
  cronJobs: {
    all: ['cronjobs'] as const,
    list: () => [...moduleKeys.cronJobs.all, 'list'] as const,
    detail: (id: string) => [...moduleKeys.cronJobs.all, 'detail', id] as const,
  },
  functions: {
    all: ['functions'] as const,
    list: () => [...moduleKeys.functions.all, 'list'] as const,
    detail: (id: string) => [...moduleKeys.functions.all, 'detail', id] as const,
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
        return queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(newModule.id), newModule);
      },
    }),
    defaultModuleErrorMessages,
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
        await queryClient.invalidateQueries({ queryKey: moduleKeys.detail(moduleId) });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(moduleId) });
      },
    }),
    {},
  );
};

export const moduleExportOptions = (versionId: string, enabled: boolean = true) =>
  queryOptions<ModuleExportDTOAPI['data'], AxiosError<ModuleExportDTOAPI>>({
    queryKey: moduleKeys.export(versionId),
    queryFn: async () => (await getApiClient().module.moduleVersionControllerExport({ versionId })).data.data,
    enabled: enabled,
  });

export const useModuleImport = () => {
  const apiClient = getApiClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<void, BuiltinModule>(
    useMutation<AxiosResponse<void>, AxiosError<ModuleExportDTOAPI>, BuiltinModule>({
      mutationFn: async (mod) => await apiClient.module.moduleVersionControllerImport(mod),
      onSuccess: async () => {
        enqueueSnackbar('Module imported!', { variant: 'default', type: 'success' });
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
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(updatedModule.id) });
        return queryClient.setQueryData(moduleKeys.detail(updatedModule.id), updatedModule);
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
      onSuccess: async (newHook: HookOutputDTO) => {
        enqueueSnackbar('Hook created!', { variant: 'default', type: 'success' });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.hooks.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(newHook.versionId) });
        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(newHook.versionId), (prev) => {
          if (!prev) {
            // we are updating a module that does not have a cache entry
            return prev;
          }
          return {
            ...prev,
            hooks: [...prev.latestVersion.hooks, newHook],
          };
        });
        return queryClient.setQueryData(moduleKeys.hooks.detail(newHook.id), newHook);
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
        await queryClient.invalidateQueries({ queryKey: moduleKeys.hooks.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(versionId) });
        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(versionId), (prev) => {
          if (!prev) {
            return prev;
          }
          return {
            ...prev,
            hooks: prev.latestVersion.hooks.filter((hook) => hook.id !== hookId),
          };
        });
        return queryClient.removeQueries({ queryKey: moduleKeys.hooks.detail(hookId) });
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
        await queryClient.invalidateQueries({ queryKey: moduleKeys.hooks.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(updatedHook.versionId) });
        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(updatedHook.versionId), (prev) => {
          if (!prev) {
            return prev;
          }
          return {
            ...prev,
            hooks: prev.latestVersion.hooks.map((h) => (h.id === updatedHook.id ? updatedHook : h)),
          };
        });
        queryClient.setQueryData<HookOutputDTO>(moduleKeys.hooks.detail(updatedHook.id), updatedHook);
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
        await queryClient.invalidateQueries({ queryKey: moduleKeys.commands.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(newCommand.versionId) });
        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(newCommand.versionId), (prev) => {
          if (!prev) {
            return prev;
          }
          return {
            ...prev,
            commands: [...prev.latestVersion.commands, newCommand],
          };
        });
        return queryClient.setQueryData<CommandOutputDTO>(moduleKeys.commands.detail(newCommand.id), newCommand);
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
        await queryClient.invalidateQueries({ queryKey: moduleKeys.commands.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(updatedCommand.versionId) });
        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(updatedCommand.id), (prev) => {
          if (!prev) {
            return prev;
          }
          return {
            ...prev,
            commands: prev.latestVersion.commands.map((c) => (c.id === updatedCommand.id ? updatedCommand : c)),
          };
        });
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
        await queryClient.invalidateQueries({ queryKey: moduleKeys.commands.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(versionId) });
        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(versionId), (prev) => {
          if (!prev) {
            return prev;
          }
          return {
            ...prev,
            commands: prev.latestVersion.commands.filter((command) => command.id !== commandId),
          };
        });
        queryClient.removeQueries({ queryKey: moduleKeys.commands.detail(commandId) });
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
        await queryClient.invalidateQueries({ queryKey: moduleKeys.cronJobs.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(newCronJob.versionId) });
        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(newCronJob.versionId), (prev) => {
          if (!prev) {
            return prev;
          }
          return {
            ...prev,
            cronJobs: [...prev.latestVersion.cronJobs, newCronJob],
          };
        });
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
        await queryClient.invalidateQueries({ queryKey: moduleKeys.cronJobs.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(updatedCronJob.versionId) });
        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(updatedCronJob.versionId), (prev) => {
          if (!prev) {
            return prev;
          }
          return {
            ...prev,
            cronJobs: prev.latestVersion.cronJobs.map((c) => (c.id === updatedCronJob.id ? updatedCronJob : c)),
          };
        });
        return queryClient.setQueryData<CronJobOutputDTO>(
          moduleKeys.cronJobs.detail(updatedCronJob.id),
          updatedCronJob,
        );
      },
    }),
    defaultCronJobErrorMessages,
  );
};

interface CronJobRemove {
  cronJobId: string;
}

export const useCronJobRemove = ({ versionId }: { versionId: string }) => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return mutationWrapper<APIOutput, CronJobRemove>(
    useMutation<APIOutput, AxiosError<APIOutput>, CronJobRemove>({
      mutationFn: async ({ cronJobId }: { cronJobId: string }) =>
        (await apiClient.cronjob.cronJobControllerRemove(cronJobId)).data,
      onSuccess: async (_, { cronJobId }) => {
        enqueueSnackbar('Cronjob successfully deleted!', { variant: 'default', type: 'success' });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.cronJobs.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.export(versionId) });
        queryClient.removeQueries({ queryKey: moduleKeys.cronJobs.detail(cronJobId) });
        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(versionId), (prev) => {
          if (!prev) {
            return prev;
          }
          return {
            ...prev,
            cronJobs: prev.latestVersion.cronJobs.filter((cronJob) => cronJob.id !== cronJobId),
          };
        });
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

export const useFunctionCreate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<FunctionOutputDTO, FunctionCreateDTO>(
    useMutation<FunctionOutputDTO, AxiosError<FunctionOutputDTOAPI>, FunctionCreateDTO>({
      mutationFn: async (fn) => (await apiClient.function.functionControllerCreate(fn)).data.data,
      onSuccess: async (newFn: FunctionOutputDTO) => {
        // invalidate list of functions
        await queryClient.invalidateQueries({ queryKey: moduleKeys.functions.list() });

        if (newFn.versionId) {
          queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(newFn.versionId), (prev) => {
            if (!prev) {
              return prev;
            }
            return {
              ...prev,
              functions: [...prev.latestVersion.functions, newFn],
            };
          });
        }

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
}
export const useFunctionUpdate = () => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<FunctionOutputDTO, FunctionUpdate>(
    useMutation<FunctionOutputDTO, AxiosError<FunctionOutputDTOAPI>, FunctionUpdate>({
      mutationFn: async ({ functionId, fn }) =>
        (await apiClient.function.functionControllerUpdate(functionId, fn)).data.data,
      onSuccess: async (updatedFn: FunctionOutputDTO) => {
        // invalidate list of functions
        await queryClient.invalidateQueries({ queryKey: moduleKeys.functions.list() });
        // update cache entry of specific function
        queryClient.setQueryData<FunctionOutputDTO>(moduleKeys.functions.detail(updatedFn.id), updatedFn);
      },
    }),
    defaultFunctionErrorMessages,
  );
};

interface FunctionRemove {
  functionId: string;
}

export const useFunctionRemove = ({ versionId }: { versionId: string }) => {
  const apiClient = getApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<APIOutput, FunctionRemove>(
    useMutation<APIOutput, AxiosError<APIOutput>, FunctionRemove>({
      mutationFn: async ({ functionId }) => (await apiClient.function.functionControllerRemove(functionId)).data,
      onSuccess: async (_, { functionId }) => {
        await queryClient.invalidateQueries({ queryKey: moduleKeys.functions.list() });
        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(versionId), (prev) => {
          if (!prev) {
            return prev;
          }
          return {
            ...prev,
            functions: prev.latestVersion.functions.filter((func) => func.id !== functionId),
          };
        });

        queryClient.removeQueries({ queryKey: moduleKeys.functions.detail(functionId) });
      },
    }),
    defaultFunctionErrorMessages,
  );
};
