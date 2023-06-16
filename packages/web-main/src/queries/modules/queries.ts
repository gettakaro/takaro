import { useMutation, useQuery, useQueryClient } from 'react-query';
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
  ModuleOutputDTO,
  ModuleUpdateDTO,
} from '@takaro/apiclient';
import { TakaroError } from 'queries/errorType';

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

// TODO: this should include the pagination logic
export const useModules = () => {
  const apiClient = useApiClient();

  return useQuery<ModuleOutputDTO[], TakaroError>({
    queryKey: moduleKeys.list(),
    queryFn: async () =>
      (await apiClient.module.moduleControllerSearch()).data.data,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

export const useModule = (id: string) => {
  const apiClient = useApiClient();

  return useQuery<ModuleOutputDTO, TakaroError>({
    queryKey: moduleKeys.detail(id),
    queryFn: async () =>
      (await apiClient.module.moduleControllerGetOne(id)).data.data,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

export const useModuleCreate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<ModuleOutputDTO, TakaroError, ModuleCreateDTO>({
    mutationFn: async (moduleCreateDTO) =>
      (await apiClient.module.moduleControllerCreate(moduleCreateDTO)).data
        .data,
    onSuccess: (newModule: ModuleOutputDTO) => {
      // update item in list of modules
      queryClient.setQueryData<ModuleOutputDTO[]>(moduleKeys.list(), (old) =>
        old ? [...old, newModule] : old!
      );
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

export const useModuleRemove = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<IdUuidDTO, TakaroError, { id: string }>({
    mutationFn: async ({ id }) =>
      (await apiClient.module.moduleControllerRemove(id)).data.data,
    onSuccess: (removedModule: IdUuidDTO) => {
      // Remove item from module list
      queryClient.setQueryData<ModuleOutputDTO[]>(moduleKeys.list(), (old) =>
        old ? old.filter((mod) => mod.id !== removedModule.id) : old!
      );

      // Invalidate query of specific module
      queryClient.invalidateQueries(moduleKeys.detail(removedModule.id));
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

interface ModuleUpdate {
  moduleUpdate: ModuleUpdateDTO;
  id: string;
}
export const useModuleUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<ModuleOutputDTO, TakaroError, ModuleUpdate>({
    mutationFn: async ({ id, moduleUpdate }) =>
      (await apiClient.module.moduleControllerUpdate(id, moduleUpdate)).data
        .data,
    onSuccess: (updatedModule: ModuleOutputDTO) => {
      // update item in module list
      queryClient.setQueryData<ModuleOutputDTO[]>(moduleKeys.list(), (old) =>
        old
          ? old.map((mod) =>
              mod.id === updatedModule.id ? updatedModule : mod
            )
          : old!
      );

      // Cache the returned module as new data in case that specific module is queried.
      queryClient.setQueryData(
        moduleKeys.detail(updatedModule.id),
        updatedModule
      );
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

// ==================================
//              hooks
// ==================================
export const useHook = (hookId: string) => {
  const apiClient = useApiClient();

  return useQuery<HookOutputDTO, TakaroError>({
    queryKey: hookKeys.detail(hookId),
    queryFn: async () =>
      (await apiClient.hook.hookControllerGetOne(hookId)).data.data,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

export const useHookCreate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<HookOutputDTO, TakaroError, HookCreateDTO>({
    mutationFn: async (hook: HookCreateDTO) =>
      (await apiClient.hook.hookControllerCreate(hook)).data.data,
    onSuccess: async (newHook: HookOutputDTO) => {
      // add item to list of hooks
      queryClient.setQueryData<HookOutputDTO[]>(hookKeys.list(), (hooks) =>
        hooks ? [...hooks, newHook] : hooks!
      );
      queryClient.invalidateQueries(moduleKeys.detail(newHook.moduleId));
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

export const useHookRemove = ({ moduleId }) => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<IdUuidDTO, TakaroError, { hookId: string }>({
    mutationFn: async ({ hookId }) =>
      (await apiClient.hook.hookControllerRemove(hookId)).data.data,
    onSuccess: async (removedHook: IdUuidDTO) => {
      // Remove item from list of hooks
      queryClient.setQueryData<HookOutputDTO[]>(hookKeys.list(), (hooks) =>
        hooks ? hooks.filter((hook) => hook.id !== removedHook.id) : hooks!
      );

      // Invalidate removed hook's query
      queryClient.invalidateQueries(hookKeys.detail(removedHook.id));

      queryClient.invalidateQueries(moduleKeys.detail(moduleId));
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

interface HookUpdate {
  hookId: string;
  hook: HookUpdateDTO;
}
export const useHookUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<HookOutputDTO, TakaroError, HookUpdate>({
    mutationFn: async ({ hookId, hook }: HookUpdate) =>
      (await apiClient.hook.hookControllerUpdate(hookId, hook)).data.data,
    onSuccess: async (updatedHook: HookOutputDTO) => {
      // add item to list of hooks
      queryClient.setQueryData<HookOutputDTO[]>(hookKeys.list(), (hooks) =>
        hooks
          ? hooks.map((hook) =>
              hook.id === updatedHook.id ? updatedHook : hook
            )
          : hooks!
      );
      queryClient.invalidateQueries(moduleKeys.detail(updatedHook.moduleId));
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

// ==================================
//              commands
// ==================================
export const useCommand = (commandId: string) => {
  const apiClient = useApiClient();

  return useQuery<CommandOutputDTO, TakaroError>({
    queryKey: commandKeys.detail(commandId),
    queryFn: async () =>
      (await apiClient.command.commandControllerGetOne(commandId)).data.data,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

export const useCommandCreate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<CommandOutputDTO, TakaroError, CommandCreateDTO>({
    mutationFn: async (command: CommandCreateDTO) =>
      (await apiClient.command.commandControllerCreate(command)).data.data,
    onSuccess: async (newCommand: CommandOutputDTO) => {
      // add item to command list
      queryClient.setQueryData<CommandOutputDTO[]>(
        commandKeys.list(),
        (commands) => (commands ? [...commands, newCommand] : commands!)
      );
      queryClient.invalidateQueries(moduleKeys.detail(newCommand.moduleId));
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

interface CommandUpdate {
  commandId: string;
  command: CommandUpdateDTO;
}
export const useCommandUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<CommandOutputDTO, TakaroError, CommandUpdate>({
    mutationFn: async ({ commandId, command }: CommandUpdate) =>
      (await apiClient.command.commandControllerUpdate(commandId, command)).data
        .data,
    onSuccess: async (updatedCommand: CommandOutputDTO) => {
      // add item to command list
      queryClient.setQueryData<CommandOutputDTO[]>(
        commandKeys.list(),
        (commands) =>
          commands
            ? commands.map((command) =>
                command.id === updatedCommand.id ? updatedCommand : command
              )
            : commands!
      );
      queryClient.invalidateQueries(moduleKeys.detail(updatedCommand.moduleId));
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

export const useCommandRemove = ({ moduleId }) => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<IdUuidDTO, TakaroError, { commandId: string }>({
    mutationFn: async ({ commandId }) =>
      (await apiClient.command.commandControllerRemove(commandId)).data.data,
    onSuccess: async (removedCommand: IdUuidDTO) => {
      // Remove item from list of commands
      queryClient.setQueryData<CommandOutputDTO[]>(
        commandKeys.list(),
        (commands) =>
          commands
            ? commands.filter((command) => command.id !== removedCommand.id)
            : commands!
      );

      // Invalidate removed hook's query
      queryClient.invalidateQueries(hookKeys.detail(removedCommand.id));
      queryClient.invalidateQueries(moduleKeys.detail(moduleId));
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

// ==================================
//              cronjobs
// ==================================
export const useCronJob = (cronJobId: string) => {
  const apiClient = useApiClient();

  return useQuery<CronJobOutputDTO, TakaroError>({
    queryKey: cronJobKeys.detail(cronJobId),
    queryFn: async () =>
      (await apiClient.cronjob.cronJobControllerGetOne(cronJobId)).data.data,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

export const useCronJobCreate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<CronJobOutputDTO, TakaroError, CronJobCreateDTO>({
    mutationFn: async (cronJob) =>
      (await apiClient.cronjob.cronJobControllerCreate(cronJob)).data.data,
    onSuccess: async (newCronJob: CronJobOutputDTO) => {
      // add item to command list
      queryClient.setQueryData<CronJobOutputDTO[]>(
        cronJobKeys.list(),
        (cronJobs) => (cronJobs ? [...cronJobs, newCronJob] : cronJobs!)
      );

      queryClient.invalidateQueries(moduleKeys.detail(newCronJob.moduleId));
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

interface CronJobUpdate {
  cronJobId: string;
  cronJob: CronJobUpdateDTO;
}
export const useCronJobUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<CronJobOutputDTO, TakaroError, CronJobUpdate>({
    mutationFn: async ({ cronJobId, cronJob }) =>
      (await apiClient.cronjob.cronJobControllerUpdate(cronJobId, cronJob)).data
        .data,
    onSuccess: async (updatedCronJob: CronJobOutputDTO) => {
      // add item to command list
      queryClient.setQueryData<CronJobOutputDTO[]>(
        cronJobKeys.list(),
        (cronJobs) =>
          cronJobs
            ? cronJobs.map((cronJob) =>
                cronJob.id === updatedCronJob.id ? updatedCronJob : cronJob
              )
            : cronJobs!
      );
      queryClient.invalidateQueries(moduleKeys.detail(updatedCronJob.moduleId));
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

export const useCronJobRemove = ({ moduleId }) => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<IdUuidDTO, TakaroError, { cronJobId: string }>({
    mutationFn: async ({ cronJobId }) =>
      (await apiClient.cronjob.cronJobControllerRemove(cronJobId)).data.data,
    onSuccess: async (removedCronJob: IdUuidDTO) => {
      // Remove item from list of cronjobs
      queryClient.setQueryData<CronJobOutputDTO[]>(
        commandKeys.list(),
        (cronJobs) =>
          cronJobs
            ? cronJobs.filter((cronjob) => cronjob.id !== removedCronJob.id)
            : cronJobs!
      );

      // Invalidate removed cronjob's query
      queryClient.invalidateQueries(cronJobKeys.detail(removedCronJob.id));

      queryClient.invalidateQueries(moduleKeys.detail(moduleId));
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

// ==================================
//              functions
// ==================================
export const useFunction = (functionId: string) => {
  const apiClient = useApiClient();

  return useQuery<FunctionOutputDTO, TakaroError>({
    queryKey: functionKeys.detail(functionId),
    queryFn: async () =>
      (await apiClient.function.functionControllerGetOne(functionId)).data.data,
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

export const useFunctionCreate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<FunctionOutputDTO, TakaroError, FunctionCreateDTO>({
    mutationFn: async (fn) =>
      (await apiClient.function.functionControllerCreate(fn)).data.data,
    onSuccess: async (newFn: FunctionOutputDTO) => {
      queryClient.setQueryData<FunctionOutputDTO[]>(
        functionKeys.list(),
        (functions) => (functions ? [...functions, newFn] : functions!)
      );
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

interface FunctionUpdate {
  functionId: string;
  fn: FunctionUpdateDTO;
}
export const useFunctionUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<FunctionOutputDTO, TakaroError, FunctionUpdate>({
    mutationFn: async ({ functionId, fn }) =>
      (await apiClient.function.functionControllerUpdate(functionId, fn)).data
        .data,
    onSuccess: async (updated: FunctionOutputDTO) => {
      queryClient.setQueryData<FunctionOutputDTO[]>(
        functionKeys.list(),
        (fns) =>
          fns ? fns.map((fn) => (fn.id === updated.id ? updated : fn)) : fns!
      );
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};

export const useFunctionRemove = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<IdUuidDTO, TakaroError, { functionId: string }>({
    mutationFn: async ({ functionId }) =>
      (await apiClient.function.functionControllerRemove(functionId)).data.data,
    onSuccess: async (removed: IdUuidDTO) => {
      // Remove item from list of cronjobs
      queryClient.setQueryData<FunctionOutputDTO[]>(
        functionKeys.list(),
        (fns) => (fns ? fns.filter((fn) => fn.id !== removed.id) : fns!)
      );
    },
    useErrorBoundary: (error) => error.response!.status >= 500,
  });
};
