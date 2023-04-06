import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useApiClient } from 'hooks/useApiClient';
import {
  APIOutput,
  CommandCreateDTO,
  CommandOutputDTO,
  CommandUpdateDTO,
  CronJobCreateDTO,
  CronJobOutputDTO,
  HookCreateDTO,
  HookOutputDTO,
  HookUpdateDTO,
  ModuleCreateDTO,
  ModuleOutputDTO,
  ModuleUpdateDTO,
} from '@takaro/apiclient';

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
  all: ['hooks'] as const,
  list: () => [...commandKeys.all, 'list'] as const,
  detail: (id: string) => [...commandKeys.all, 'detail', id] as const,
};

export const cronJobKeys = {
  all: ['hooks'] as const,
  list: () => [...cronJobKeys.all, 'list'] as const,
  detail: (id: string) => [...cronJobKeys.all, 'detail', id] as const,
};

// TODO: this should include the pagination logic
export const useModules = () => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: moduleKeys.list(),
    queryFn: async () => await apiClient.module.moduleControllerSearch(),
  });
};

export const useModule = (id: string) => {
  const apiClient = useApiClient();

  return useQuery<ModuleOutputDTO>({
    queryKey: moduleKeys.detail(id),
    queryFn: async () =>
      (await apiClient.module.moduleControllerGetOne(id)).data.data,
  });
};

export const useModuleCreate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moduleCreateDTO: ModuleCreateDTO) =>
      (await apiClient.module.moduleControllerCreate(moduleCreateDTO)).data
        .data,
    onSuccess: (newModule: ModuleOutputDTO) => {
      // update item in list of modules
      queryClient.setQueryData<ModuleOutputDTO[]>(moduleKeys.list(), (old) =>
        old ? [...old, newModule] : old!
      );
    },
  });
};

export const useModuleRemove = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) =>
      (await apiClient.module.moduleControllerRemove(id)).data,
    onSuccess: (removedModule: APIOutput) => {
      // TODO: 'id' should be replace with the id in the removedModule: APIOutput
      // Remove item from module list
      queryClient.setQueryData<ModuleOutputDTO[]>(moduleKeys.list(), (old) =>
        old ? old.filter((module) => module.id === 'id') : old!
      );

      // TODO: replace 'id' with the actual id when available in removedModule
      // Invalidate query of specific module
      queryClient.invalidateQueries(moduleKeys.detail('id'));
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
      (await apiClient.module.moduleControllerUpdate(id, moduleUpdate)).data
        .data,
    onSuccess: (updatedModule: ModuleOutputDTO) => {
      // update item in module list
      queryClient.setQueryData<ModuleOutputDTO[]>(moduleKeys.list(), (old) =>
        old
          ? old.map((module) =>
              module.id === updatedModule.id ? updatedModule : module
            )
          : old!
      );

      // Cache the returned module as new data in case that specific module is queried.
      queryClient.setQueryData(
        moduleKeys.detail(updatedModule.id),
        updatedModule
      );
    },
  });
};

// ==================================
//              hooks
// ==================================
export const useHook = (hookId: string) => {
  const apiClient = useApiClient();

  return useQuery({
    queryKey: moduleKeys.detail(hookId),
    queryFn: async () =>
      (await apiClient.hook.hookControllerGetOne(hookId)).data.data,
  });
};

export const useHookCreate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hook: HookCreateDTO) =>
      (await apiClient.hook.hookControllerCreate(hook)).data.data,
    onSuccess: async (newHook: HookOutputDTO) => {
      // add item to list of hooks
      queryClient.setQueryData<HookOutputDTO[]>(hookKeys.list(), (hooks) =>
        hooks ? [...hooks, newHook] : hooks!
      );
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
        hooks
          ? hooks.map((hook) =>
              hook.id === updatedHook.id ? updatedHook : hook
            )
          : hooks!
      );
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
    queryFn: async () =>
      (await apiClient.command.commandControllerGetOne(commandId)).data.data,
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
      queryClient.setQueryData<CommandOutputDTO[]>(
        commandKeys.list(),
        (commands) => (commands ? [...commands, newCommand] : commands!)
      );
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
    queryFn: async () =>
      (await apiClient.cronjob.cronJobControllerGetOne(cronJobId)).data.data,
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
      queryClient.setQueryData<CronJobOutputDTO[]>(
        cronJobKeys.list(),
        (cronJobs) => (cronJobs ? [...cronJobs, newCronJob] : cronJobs!)
      );
    },
  });
};

interface CronJobUpdate {
  cronJobId: string;
  cronJob: CommandUpdateDTO;
}
export const useCronJobUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cronJobId, cronJob }: CronJobUpdate) =>
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
    },
  });
};
