import { InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from 'react-query';
import { useApiClient } from 'hooks/useApiClient';
import {
  CommandCreateDTO,
  CommandOutputDTO,
  CommandUpdateDTO,
  CronJobCreateDTO,
  CronJobOutputDTO,
  CronJobUpdateDTO,
  FunctionCreateDTO,
  FunctionOutputDTO,
  FunctionUpdateDTO,
  HookCreateDTO,
  HookOutputDTO,
  HookUpdateDTO,
  IdUuidDTO,
  ModuleCreateDTO,
  ModuleOutputArrayDTOAPI,
  ModuleOutputDTO,
  ModuleSearchInputDTO,
  ModuleUpdateDTO,
} from '@takaro/apiclient';
import * as Sentry from '@sentry/react';

import { hasNextPage } from '../util';

export const moduleKeys = {
  all: ['modules'] as const,
  list: () => [...moduleKeys.all, 'list'] as const,
  detail: (id: string) => [...moduleKeys.all, 'detail', id] as const,
};

export const hookKeys = {
  all: ['hooks'] as const,
  list: () => [...hookKeys.all, 'list'] as const,
  detail: (id: string) => [...hookKeys.all, 'detail', id] as const,
};

export const commandKeys = {
  all: ['commands'] as const,
  list: () => [...commandKeys.all, 'list'] as const,
  detail: (id: string) => [...commandKeys.all, 'detail', id] as const,
};

export const cronJobKeys = {
  all: ['cronjobs'] as const,
  list: () => [...cronJobKeys.all, 'list'] as const,
  detail: (id: string) => [...cronJobKeys.all, 'detail', id] as const,
};

export const functionKeys = {
  all: ['functions'] as const,
  list: () => [...functionKeys.all, 'list'] as const,
  detail: (id: string) => [...functionKeys.all, 'detail', id] as const,
};

export const useModules = ({ page = 0, ...moduleSearchInputArgs }: ModuleSearchInputDTO = {}) => {
  const apiClient = useApiClient();

  return useInfiniteQuery<ModuleOutputArrayDTOAPI>({
    queryKey: moduleKeys.list(),
    queryFn: async ({ pageParam = page }) =>
      (
        await apiClient.module.moduleControllerSearch({
          page: pageParam,
          ...moduleSearchInputArgs,
        })
      ).data,
    getNextPageParam: (lastPage, pages) => hasNextPage(lastPage.meta, pages.length),
  });
};

export const useModule = (id: string) => {
  const apiClient = useApiClient();

  return useQuery<ModuleOutputDTO>({
    queryKey: moduleKeys.detail(id),
    queryFn: async () => (await apiClient.module.moduleControllerGetOne(id)).data.data,
  });
};

export const useModuleCreate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moduleCreateDTO: ModuleCreateDTO) =>
      (await apiClient.module.moduleControllerCreate(moduleCreateDTO)).data.data,
    onSuccess: (newModule: ModuleOutputDTO) => {
      queryClient.setQueryData<InfiniteData<ModuleOutputArrayDTOAPI>>(moduleKeys.list(), (prev) => {
        // in case there are no modules yet
        if (!prev) {
          return {
            pages: [
              {
                data: [newModule],
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
            data: [...page.data, newModule],
          })),
        };
        return newData;
      });
    },
  });
};

export const useModuleRemove = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => (await apiClient.module.moduleControllerRemove(id)).data.data,
    onSuccess: (removedModule: IdUuidDTO) => {
      try {
        // Remove item from list of modules
        queryClient.setQueryData<InfiniteData<ModuleOutputArrayDTOAPI>>(moduleKeys.list(), (prev) => {
          if (!prev) {
            throw new Error('Cannot remove module from list, because list does not exist');
          }

          return {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              data: page.data.filter((mod) => mod.id !== removedModule.id),
            })),
          };
        });

        // Invalidate query of specific module
        queryClient.invalidateQueries(moduleKeys.detail(removedModule.id));
      } catch (e) {
        Sentry.captureException(e);
      }
    },
  });
};

interface ModuleUpdate {
  moduleUpdate: ModuleUpdateDTO;
  id: string;
}
export const useModuleUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, moduleUpdate }: ModuleUpdate) =>
      (await apiClient.module.moduleControllerUpdate(id, moduleUpdate)).data.data,
    onSuccess: (updatedModule: ModuleOutputDTO) => {
      try {
        // update module in list ofm modules
        queryClient.setQueryData<InfiniteData<ModuleOutputArrayDTOAPI>>(moduleKeys.list(), (prev) => {
          if (!prev) {
            queryClient.invalidateQueries(moduleKeys.list());
            throw new Error('Cannot update module list, because it does not exist');
          }

          return {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              data: page.data.map((gameServer) => {
                if (gameServer.id === updatedModule.id) {
                  return updatedModule;
                }
                return gameServer;
              }),
            })),
          };
        });

        // Cache the returned module as new data in case that specific module is queried.
        queryClient.setQueryData(moduleKeys.detail(updatedModule.id), updatedModule);
      } catch (e) {
        Sentry.captureException(e);
      }
    },
  });
};

// ==================================
//              hooks
// ==================================
export const useHook = (hookId: string) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: hookKeys.detail(hookId),
    queryFn: async () => (await apiClient.hook.hookControllerGetOne(hookId)).data.data,
  });
};

export const useHookCreate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hook: HookCreateDTO) => (await apiClient.hook.hookControllerCreate(hook)).data.data,
    onSuccess: async (newHook: HookOutputDTO) => {
      // add item to list of hooks
      queryClient.setQueryData<HookOutputDTO[]>(hookKeys.list(), (hooks) => (hooks ? [...hooks, newHook] : hooks!));

      queryClient.invalidateQueries(moduleKeys.detail(newHook.moduleId));
    },
  });
};

export const useHookRemove = ({ moduleId }) => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ hookId }: { hookId: string }) => (await apiClient.hook.hookControllerRemove(hookId)).data.data,
    onSuccess: async (removedHook: IdUuidDTO) => {
      // Remove item from list of hooks
      queryClient.setQueryData<HookOutputDTO[]>(hookKeys.list(), (hooks) =>
        hooks ? hooks.filter((hook) => hook.id !== removedHook.id) : hooks!
      );

      // Invalidate removed hook's query
      queryClient.invalidateQueries(hookKeys.detail(removedHook.id));

      queryClient.invalidateQueries(moduleKeys.detail(moduleId));
    },
  });
};

interface HookUpdate {
  hookId: string;
  hook: HookUpdateDTO;
}
export const useHookUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ hookId, hook }: HookUpdate) =>
      (await apiClient.hook.hookControllerUpdate(hookId, hook)).data.data,
    onSuccess: async (updatedHook: HookOutputDTO) => {
      // add item to list of hooks
      queryClient.setQueryData<HookOutputDTO[]>(hookKeys.list(), (hooks) =>
        hooks ? hooks.map((hook) => (hook.id === updatedHook.id ? updatedHook : hook)) : hooks!
      );

      queryClient.invalidateQueries(moduleKeys.detail(updatedHook.moduleId));
    },
  });
};

// ==================================
//              commands
// ==================================
export const useCommand = (commandId: string) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: commandKeys.detail(commandId),
    queryFn: async () => (await apiClient.command.commandControllerGetOne(commandId)).data.data,
  });
};

export const useCommandCreate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (command: CommandCreateDTO) =>
      (await apiClient.command.commandControllerCreate(command)).data.data,
    onSuccess: async (newCommand: CommandOutputDTO) => {
      // add item to command list
      queryClient.setQueryData<CommandOutputDTO[]>(commandKeys.list(), (commands) =>
        commands ? [...commands, newCommand] : commands!
      );

      queryClient.invalidateQueries(moduleKeys.detail(newCommand.moduleId));
    },
  });
};

interface CommandUpdate {
  commandId: string;
  command: CommandUpdateDTO;
}
export const useCommandUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commandId, command }: CommandUpdate) =>
      (await apiClient.command.commandControllerUpdate(commandId, command)).data.data,
    onSuccess: async (updatedCommand: CommandOutputDTO) => {
      // add item to command list
      queryClient.setQueryData<CommandOutputDTO[]>(commandKeys.list(), (commands) =>
        commands ? commands.map((command) => (command.id === updatedCommand.id ? updatedCommand : command)) : commands!
      );

      queryClient.invalidateQueries(moduleKeys.detail(updatedCommand.moduleId));
    },
  });
};

export const useCommandRemove = ({ moduleId }) => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commandId }: { commandId: string }) =>
      (await apiClient.command.commandControllerRemove(commandId)).data.data,
    onSuccess: async (removedCommand: IdUuidDTO) => {
      // Remove item from list of commands
      queryClient.setQueryData<CommandOutputDTO[]>(commandKeys.list(), (commands) =>
        commands ? commands.filter((command) => command.id !== removedCommand.id) : commands!
      );

      // Invalidate removed hook's query
      queryClient.invalidateQueries(hookKeys.detail(removedCommand.id));

      queryClient.invalidateQueries(moduleKeys.detail(moduleId));
    },
  });
};

// ==================================
//              cronjobs
// ==================================
export const useCronJob = (cronJobId: string) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: cronJobKeys.detail(cronJobId),
    queryFn: async () => (await apiClient.cronjob.cronJobControllerGetOne(cronJobId)).data.data,
  });
};

export const useCronJobCreate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cronjob: CronJobCreateDTO) =>
      (await apiClient.cronjob.cronJobControllerCreate(cronjob)).data.data,
    onSuccess: async (newCronJob: CronJobOutputDTO) => {
      // add item to command list
      queryClient.setQueryData<CronJobOutputDTO[]>(cronJobKeys.list(), (cronJobs) =>
        cronJobs ? [...cronJobs, newCronJob] : cronJobs!
      );

      queryClient.invalidateQueries(moduleKeys.detail(newCronJob.moduleId));
    },
  });
};

interface CronJobUpdate {
  cronJobId: string;
  cronJob: CronJobUpdateDTO;
}
export const useCronJobUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cronJobId, cronJob }: CronJobUpdate) =>
      (await apiClient.cronjob.cronJobControllerUpdate(cronJobId, cronJob)).data.data,
    onSuccess: async (updatedCronJob: CronJobOutputDTO) => {
      // add item to command list
      queryClient.setQueryData<CronJobOutputDTO[]>(cronJobKeys.list(), (cronJobs) =>
        cronJobs ? cronJobs.map((cronJob) => (cronJob.id === updatedCronJob.id ? updatedCronJob : cronJob)) : cronJobs!
      );

      queryClient.invalidateQueries(moduleKeys.detail(updatedCronJob.moduleId));
    },
  });
};

export const useCronJobRemove = ({ moduleId }) => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cronJobId }: { cronJobId: string }) =>
      (await apiClient.cronjob.cronJobControllerRemove(cronJobId)).data.data,
    onSuccess: async (removedCronJob: IdUuidDTO) => {
      // Remove item from list of cronjobs
      queryClient.setQueryData<CronJobOutputDTO[]>(commandKeys.list(), (cronJobs) =>
        cronJobs ? cronJobs.filter((cronjob) => cronjob.id !== removedCronJob.id) : cronJobs!
      );

      // Invalidate removed cronjob's query
      queryClient.invalidateQueries(cronJobKeys.detail(removedCronJob.id));

      queryClient.invalidateQueries(moduleKeys.detail(moduleId));
    },
  });
};

// ==================================
//              functions
// ==================================
export const useFunction = (functionId: string) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: functionKeys.detail(functionId),
    queryFn: async () => (await apiClient.function.functionControllerGetOne(functionId)).data.data,
  });
};

export const useFunctionCreate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fn: FunctionCreateDTO) => (await apiClient.function.functionControllerCreate(fn)).data.data,
    onSuccess: async (newFn: FunctionOutputDTO) => {
      queryClient.setQueryData<FunctionOutputDTO[]>(functionKeys.list(), (functions) =>
        functions ? [...functions, newFn] : functions!
      );
    },
  });
};

interface FunctionUpdate {
  functionId: string;
  fn: FunctionUpdateDTO;
}
export const useFunctionUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ functionId, fn }: FunctionUpdate) =>
      (await apiClient.function.functionControllerUpdate(functionId, fn)).data.data,
    onSuccess: async (updated: FunctionOutputDTO) => {
      queryClient.setQueryData<FunctionOutputDTO[]>(functionKeys.list(), (fns) =>
        fns ? fns.map((fn) => (fn.id === updated.id ? updated : fn)) : fns!
      );
    },
  });
};

export const useFunctionRemove = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ functionId }: { functionId: string }) =>
      (await apiClient.function.functionControllerRemove(functionId)).data.data,
    onSuccess: async (removed: IdUuidDTO) => {
      // Remove item from list of cronjobs
      queryClient.setQueryData<FunctionOutputDTO[]>(functionKeys.list(), (fns) =>
        fns ? fns.filter((fn) => fn.id !== removed.id) : fns!
      );
    },
  });
};
