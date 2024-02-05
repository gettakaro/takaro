import { useInfiniteQuery, useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useApiClient } from 'hooks/useApiClient';
import {
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
  IdUuidDTO,
  IdUuidDTOAPI,
  ModuleCreateDTO,
  ModuleOutputArrayDTOAPI,
  ModuleOutputDTO,
  ModuleOutputDTOAPI,
  ModuleSearchInputDTO,
  ModuleUpdateDTO,
} from '@takaro/apiclient';
import { InfiniteScroll as InfiniteScrollComponent } from '@takaro/lib-components';

import { hasNextPage, mutationWrapper } from '../util';
import { AxiosError } from 'axios';
import { useMemo } from 'react';
import { ErrorMessageMapping } from '@takaro/lib-components/src/errors';

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

export const useInfiniteModules = ({ page, ...queryParams }: ModuleSearchInputDTO = { page: 0 }) => {
  const apiClient = useApiClient();

  const queryOpts = useInfiniteQuery<ModuleOutputArrayDTOAPI, AxiosError<ModuleOutputArrayDTOAPI>>({
    queryKey: [...moduleKeys.list(), { ...queryParams }],
    queryFn: async ({ pageParam }) =>
      (
        await apiClient.module.moduleControllerSearch({
          ...queryParams,
          page: pageParam as number,
        })
      ).data,
    initialPageParam: page,
    getNextPageParam: (lastPage, pages) => hasNextPage(lastPage.meta, pages.length),
  });

  const InfiniteScroll = useMemo(() => {
    return <InfiniteScrollComponent {...queryOpts} />;
  }, [queryOpts]);

  return { ...queryOpts, InfiniteScroll };
};

export const useModules = (queryParams: ModuleSearchInputDTO = { page: 0 }, opts?: any) => {
  const apiClient = useApiClient();

  const queryOpts = useInfiniteQuery<ModuleOutputArrayDTOAPI, AxiosError<ModuleOutputArrayDTOAPI>>({
    queryKey: [...moduleKeys.list(), { ...queryParams }],
    queryFn: async ({ pageParam }) =>
      (
        await apiClient.module.moduleControllerSearch({
          ...queryParams,
          page: pageParam as number,
        })
      ).data,
    placeholderData: keepPreviousData,
    getNextPageParam: (lastPage, pages) => hasNextPage(lastPage.meta, pages.length),
    ...opts,
  });

  const InfiniteScroll = useMemo(() => {
    return <InfiniteScrollComponent {...queryOpts} />;
  }, [queryOpts]);

  return { ...queryOpts, InfiniteScroll };
};

export const useModule = (id: string) => {
  const apiClient = useApiClient();

  return useQuery<ModuleOutputDTO, AxiosError<ModuleOutputDTOAPI>>({
    queryKey: moduleKeys.detail(id),
    queryFn: async () => (await apiClient.module.moduleControllerGetOne(id)).data.data,
  });
};

export const useModuleCreate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<ModuleOutputDTO, ModuleCreateDTO>(
    useMutation<ModuleOutputDTO, AxiosError<ModuleOutputDTOAPI>, ModuleCreateDTO>({
      mutationFn: async (moduleCreateDTO: ModuleCreateDTO) =>
        (await apiClient.module.moduleControllerCreate(moduleCreateDTO)).data.data,

      onSuccess: async (newModule: ModuleOutputDTO) => {
        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
        queryClient.setQueryData<ModuleOutputDTO>(moduleKeys.detail(newModule.id), newModule);
      },
    }),
    defaultModuleErrorMessages
  );
};

interface ModuleRemove {
  id: string;
}

export const useModuleRemove = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<IdUuidDTO, ModuleRemove>(
    useMutation<IdUuidDTO, AxiosError<IdUuidDTOAPI>, ModuleRemove>({
      mutationFn: async ({ id }) => (await apiClient.module.moduleControllerRemove(id)).data.data,
      onSuccess: async (removedModule: IdUuidDTO) => {
        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.detail(removedModule.id) });
      },
    }),
    {}
  );
};

interface ModuleUpdate {
  moduleUpdate: ModuleUpdateDTO;
  id: string;
}
export const useModuleUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<ModuleOutputDTO, ModuleUpdate>(
    useMutation<ModuleOutputDTO, AxiosError<ModuleOutputDTOAPI>, ModuleUpdate>({
      mutationFn: async ({ id, moduleUpdate }) =>
        (await apiClient.module.moduleControllerUpdate(id, moduleUpdate)).data.data,
      onSuccess: async (updatedModule: ModuleOutputDTO) => {
        await queryClient.invalidateQueries({ queryKey: moduleKeys.list() });
        queryClient.setQueryData(moduleKeys.detail(updatedModule.id), updatedModule);
      },
    }),
    defaultModuleErrorMessages
  );
};

// ==================================
//              hooks
// ==================================
export const useHook = (hookId: string) => {
  const apiClient = useApiClient();

  return useQuery<HookOutputDTO, AxiosError>({
    queryKey: hookKeys.detail(hookId),
    queryFn: async () => (await apiClient.hook.hookControllerGetOne(hookId)).data.data,
  });
};

export const useHookCreate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<HookOutputDTO, HookCreateDTO>(
    useMutation<HookOutputDTO, AxiosError<HookOutputDTOAPI>, HookCreateDTO>({
      mutationFn: async (hook) => (await apiClient.hook.hookControllerCreate(hook)).data.data,
      onSuccess: async (newHook: HookOutputDTO) => {
        await queryClient.invalidateQueries({ queryKey: hookKeys.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.detail(newHook.moduleId) });
        queryClient.setQueryData(hookKeys.detail(newHook.id), newHook);
      },
    }),
    defaultHookErrorMessages
  );
};

interface HookRemove {
  hookId: string;
}

export const useHookRemove = ({ moduleId }) => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<IdUuidDTO, HookRemove>(
    useMutation<IdUuidDTO, AxiosError<IdUuidDTOAPI>, HookRemove>({
      mutationFn: async ({ hookId }) => (await apiClient.hook.hookControllerRemove(hookId)).data.data,
      onSuccess: async (removedHook: IdUuidDTO) => {
        await queryClient.invalidateQueries({ queryKey: hookKeys.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.detail(moduleId) });
        queryClient.removeQueries({ queryKey: hookKeys.detail(removedHook.id) });
      },
    }),
    defaultHookErrorMessages
  );
};

interface HookUpdate {
  hookId: string;
  hook: HookUpdateDTO;
}
export const useHookUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<HookOutputDTO, HookUpdate>(
    useMutation<HookOutputDTO, AxiosError<HookOutputDTOAPI>, HookUpdate>({
      mutationFn: async ({ hookId, hook }) => (await apiClient.hook.hookControllerUpdate(hookId, hook)).data.data,
      onSuccess: async (updatedHook: HookOutputDTO) => {
        await queryClient.invalidateQueries({ queryKey: hookKeys.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.detail(updatedHook.moduleId) });
        queryClient.setQueryData(hookKeys.detail(updatedHook.id), updatedHook);
      },
    }),
    defaultHookErrorMessages
  );
};

// ==================================
//              commands
// ==================================
export const useCommand = (commandId: string) => {
  const apiClient = useApiClient();

  return useQuery<CommandOutputDTO, AxiosError<CommandOutputDTOAPI>>({
    queryKey: commandKeys.detail(commandId),
    queryFn: async () => (await apiClient.command.commandControllerGetOne(commandId)).data.data,
  });
};

export const useCommandCreate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<CommandOutputDTO, CommandCreateDTO>(
    useMutation<CommandOutputDTO, AxiosError<CommandOutputDTOAPI>, CommandCreateDTO>({
      mutationFn: async (command) => (await apiClient.command.commandControllerCreate(command)).data.data,
      onSuccess: async (newCommand: CommandOutputDTO) => {
        await queryClient.invalidateQueries({ queryKey: commandKeys.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.detail(newCommand.moduleId) });
        queryClient.setQueryData(commandKeys.detail(newCommand.id), newCommand);
      },
    }),
    defaultCommandErrorMessages
  );
};

interface CommandUpdate {
  commandId: string;
  command: CommandUpdateDTO;
}
export const useCommandUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<CommandOutputDTO, CommandUpdate>(
    useMutation<CommandOutputDTO, AxiosError<CommandOutputDTOAPI>, CommandUpdate>({
      mutationFn: async ({ commandId, command }) =>
        (await apiClient.command.commandControllerUpdate(commandId, command)).data.data,
      onSuccess: async (updatedCommand: CommandOutputDTO) => {
        await queryClient.invalidateQueries({ queryKey: commandKeys.list() });
        await queryClient.invalidateQueries({ queryKey: moduleKeys.detail(updatedCommand.moduleId) });
        queryClient.setQueryData(commandKeys.detail(updatedCommand.id), updatedCommand);
      },
    }),
    defaultCommandErrorMessages
  );
};

interface CommandRemove {
  commandId: string;
}

export const useCommandRemove = ({ moduleId }) => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<IdUuidDTO, CommandRemove>(
    useMutation<IdUuidDTO, AxiosError<IdUuidDTOAPI>, CommandRemove>({
      mutationFn: async ({ commandId }) => (await apiClient.command.commandControllerRemove(commandId)).data.data,
      onSuccess: async (removedCommand: IdUuidDTO) => {
        // invalidate list of commands
        await queryClient.invalidateQueries({ queryKey: commandKeys.list() });

        // Invalidate query of specific module which command belongs to
        await queryClient.invalidateQueries({ queryKey: moduleKeys.detail(moduleId) });

        // remove cache of specific command
        queryClient.removeQueries({ queryKey: commandKeys.detail(removedCommand.id) });
      },
    }),
    defaultCommandErrorMessages
  );
};

// ==================================
//              cronjobs
// ==================================
export const useCronJob = (cronJobId: string) => {
  const apiClient = useApiClient();

  return useQuery<CronJobOutputDTO, AxiosError<CronJobOutputDTOAPI>>({
    queryKey: cronJobKeys.detail(cronJobId),
    queryFn: async () => (await apiClient.cronjob.cronJobControllerGetOne(cronJobId)).data.data,
  });
};

export const useCronJobCreate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<CronJobOutputDTO, CronJobCreateDTO>(
    useMutation<CronJobOutputDTO, AxiosError<CronJobOutputDTOAPI>, CronJobCreateDTO>({
      mutationFn: async (cronjob: CronJobCreateDTO) =>
        (await apiClient.cronjob.cronJobControllerCreate(cronjob)).data.data,
      onSuccess: async (newCronJob: CronJobOutputDTO) => {
        // invalidate list of cronjobs
        await queryClient.invalidateQueries({ queryKey: cronJobKeys.list() });

        // invalidate query of specific module which cronjob belongs to
        await queryClient.invalidateQueries({ queryKey: moduleKeys.detail(newCronJob.moduleId) });

        // add cache entry for new cronjob
        queryClient.setQueryData(cronJobKeys.detail(newCronJob.id), newCronJob);
      },
    }),
    defaultCronJobErrorMessages
  );
};

interface CronJobUpdate {
  cronJobId: string;
  cronJob: CronJobUpdateDTO;
}
export const useCronJobUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<CronJobOutputDTO, CronJobUpdate>(
    useMutation<CronJobOutputDTO, AxiosError<CronJobOutputDTOAPI>, CronJobUpdate>({
      mutationFn: async ({ cronJobId, cronJob }) =>
        (await apiClient.cronjob.cronJobControllerUpdate(cronJobId, cronJob)).data.data,
      onSuccess: async (updatedCronJob: CronJobOutputDTO) => {
        // invalidate list of cronjob
        await queryClient.invalidateQueries({ queryKey: cronJobKeys.list() });

        // invalidate query of specific module which cronjob belongs to
        await queryClient.invalidateQueries({ queryKey: moduleKeys.detail(updatedCronJob.moduleId) });

        // update cache entry of specific cronjob
        queryClient.setQueryData(cronJobKeys.detail(updatedCronJob.id), updatedCronJob);
      },
    }),
    defaultCronJobErrorMessages
  );
};

interface CronJobRemove {
  cronJobId: string;
}

export const useCronJobRemove = ({ moduleId }: { moduleId: string }) => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<IdUuidDTO, CronJobRemove>(
    useMutation<IdUuidDTO, AxiosError<IdUuidDTOAPI>, CronJobRemove>({
      mutationFn: async ({ cronJobId }: { cronJobId: string }) =>
        (await apiClient.cronjob.cronJobControllerRemove(cronJobId)).data.data,
      onSuccess: async (removedCronJob: IdUuidDTO) => {
        await queryClient.invalidateQueries({ queryKey: cronJobKeys.list() });

        // Invalidate query of specific module which cronjob belongs to
        await queryClient.invalidateQueries({ queryKey: moduleKeys.detail(moduleId) });

        // remove cache of specific cronjob
        queryClient.removeQueries({ queryKey: cronJobKeys.detail(removedCronJob.id) });
      },
    }),
    defaultCronJobErrorMessages
  );
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

  return mutationWrapper<FunctionOutputDTO, FunctionCreateDTO>(
    useMutation<FunctionOutputDTO, AxiosError<FunctionOutputDTOAPI>, FunctionCreateDTO>({
      mutationFn: async (fn) => (await apiClient.function.functionControllerCreate(fn)).data.data,
      onSuccess: async (newFn: FunctionOutputDTO) => {
        // invalidate list of functions
        await queryClient.invalidateQueries({ queryKey: functionKeys.list() });

        // add cache entry for new function
        queryClient.setQueryData(cronJobKeys.detail(newFn.id), newFn);
      },
    }),
    defaultFunctionErrorMessages
  );
};

interface FunctionUpdate {
  functionId: string;
  fn: FunctionUpdateDTO;
}
export const useFunctionUpdate = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<FunctionOutputDTO, FunctionUpdate>(
    useMutation<FunctionOutputDTO, AxiosError<FunctionOutputDTOAPI>, FunctionUpdate>({
      mutationFn: async ({ functionId, fn }) =>
        (await apiClient.function.functionControllerUpdate(functionId, fn)).data.data,
      onSuccess: async (updatedFn: FunctionOutputDTO) => {
        // invalidate list of functions
        await queryClient.invalidateQueries({ queryKey: functionKeys.list() });

        // update cache entry of specific function
        queryClient.setQueryData(cronJobKeys.detail(updatedFn.id), updatedFn);
      },
    }),
    defaultFunctionErrorMessages
  );
};

interface FunctionRemove {
  functionId: string;
}

export const useFunctionRemove = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return mutationWrapper<IdUuidDTO, FunctionRemove>(
    useMutation<IdUuidDTO, AxiosError<IdUuidDTOAPI>, FunctionRemove>({
      mutationFn: async ({ functionId }) => (await apiClient.function.functionControllerRemove(functionId)).data.data,
      onSuccess: async (removedFn: IdUuidDTO) => {
        // invalidate list of functions
        await queryClient.invalidateQueries({ queryKey: functionKeys.list() });

        // remove cache of specific function
        queryClient.removeQueries({ queryKey: functionKeys.detail(removedFn.id) });
      },
    }),
    defaultFunctionErrorMessages
  );
};
