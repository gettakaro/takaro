import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import { Button, TextField, FormError, Alert } from '@takaro/lib-components';
import { FC } from 'react';
import { AiOutlineCopy as CopyIcon } from 'react-icons/ai';

import {
  useCommandCreate,
  useCronJobCreate,
  useHookCreate,
  moduleQueryOptions,
  useModuleCreate,
  useModuleRemove,
  useFunctionCreate,
} from 'queries/module';
import { moduleNameShape } from 'routes/_auth/_global/-modules/ModuleForm/validationSchema';
import { useQuery } from '@tanstack/react-query';

const validationSchema = z.object({
  name: moduleNameShape,
});

interface CopyModuleFormProps {
  moduleId: string;
  onSuccess?: (moduleId: string) => void;
}

export const CopyModuleForm: FC<CopyModuleFormProps> = ({ moduleId, onSuccess }) => {
  const { data: mod, isPending } = useQuery(moduleQueryOptions(moduleId));
  const { enqueueSnackbar } = useSnackbar();

  const { control, handleSubmit } = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
  });

  const { mutateAsync: createModule, isPending: moduleCreateLoading, error: moduleCreateError } = useModuleCreate();
  const { mutateAsync: createHook, isPending: hookCreateLoading, error: hookCreateError } = useHookCreate();
  const { mutateAsync: createCommand, isPending: commandCreateLoading, error: commandCreateError } = useCommandCreate();
  const { mutateAsync: createCronJob, isPending: cronJobCreateLoading, error: cronJobCreateError } = useCronJobCreate();
  const {
    mutateAsync: createFunction,
    isPending: functionCreateLoading,
    error: functionCreateError,
  } = useFunctionCreate();

  const { mutateAsync: removeModule, isPending: moduleRemoveLoading } = useModuleRemove();

  const isLoading =
    moduleCreateLoading ||
    hookCreateLoading ||
    commandCreateLoading ||
    cronJobCreateLoading ||
    moduleRemoveLoading ||
    functionCreateLoading;

  if (isPending) {
    return;
  }

  if (!mod) {
    enqueueSnackbar('Module not found', { variant: 'default', type: 'error' });
    return;
  }

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = async ({ name }) => {
    const createdModule = await createModule({
      name,
      configSchema: mod.configSchema,
      permissions: mod.permissions.map((perm) => ({
        description: perm.description,
        permission: perm.permission,
        friendlyName: `${mod.name}_${perm.friendlyName}`,
        canHaveCount: perm.canHaveCount,
      })),
      uiSchema: mod.uiSchema,
      description: mod.description,
    });

    if (!createdModule) {
      return;
    }

    try {
      if (createdModule) {
        await Promise.all([
          ...mod.hooks.map((hook) =>
            createHook({
              moduleId: createdModule.id,
              name: hook.name,
              eventType: hook.eventType,
              regex: hook.regex ?? '',
              function: hook.function.code,
            }),
          ),
          ...mod.commands.map((command) =>
            createCommand({
              moduleId: createdModule.id,
              name: command.name,
              trigger: command.trigger,
              helpText: command.helpText,
              function: command.function.code,
              arguments: command.arguments.map((arg) => ({
                name: arg.name,
                type: arg.type,
                helpText: arg.helpText,
                position: arg.position,
              })),
            }),
          ),
          ...mod.functions.map((f) =>
            createFunction({
              moduleId: createdModule.id,
              name: f.name,
              code: f.code,
            }),
          ),
          ...mod.cronJobs.map((cronJob) =>
            createCronJob({
              moduleId: createdModule.id,
              name: cronJob.name,
              temporalValue: cronJob.temporalValue,
              function: cronJob.function.code,
            }),
          ),
        ]);

        if (onSuccess) {
          onSuccess(createdModule.id);
        }
      }
    } catch (_error) {
      await removeModule({ moduleId: createdModule.id });
    }
  };

  return (
    <>
      <Alert
        variant="warning"
        text="The new module will have all the same hooks, commands, and cron jobs as the original module. 
        Installing the copied module will cause triggers to occur twice, since it has the same command names as the original module."
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          control={control}
          name="name"
          placeholder="Module Name"
          label="Module Name"
          description=""
          required
          loading={isLoading}
        />
        <Button isLoading={isLoading} type="submit" icon={<CopyIcon />} text="Copy Module" fullWidth />
      </form>

      <div style={{ height: '10px' }} />
      {moduleCreateError && <FormError error={moduleCreateError} />}
      {hookCreateError && <FormError error={hookCreateError} />}
      {commandCreateError && <FormError error={commandCreateError} />}
      {cronJobCreateError && <FormError error={cronJobCreateError} />}
      {functionCreateError && <FormError error={functionCreateError} />}
    </>
  );
};
