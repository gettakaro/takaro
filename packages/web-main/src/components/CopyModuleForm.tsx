import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import { Button, TextField, FormError, errors, Alert } from '@takaro/lib-components';
import { FC, useState } from 'react';
import { AiOutlineCopy as CopyIcon } from 'react-icons/ai';

import {
  useCommandCreate,
  useCronJobCreate,
  useHookCreate,
  useModuleCreate,
  useModule,
  useModuleRemove,
} from 'queries/modules';
import { moduleNameShape } from 'pages/ModuleDefinitions/ModuleForm/validationSchema';

const validationSchema = z.object({
  name: moduleNameShape,
});

interface CopyModuleFormProps {
  moduleId: string;
  onSuccess?: (moduleId: string) => void;
}

export const CopyModuleForm: FC<CopyModuleFormProps> = ({ moduleId, onSuccess }) => {
  const { data: mod, isPending } = useModule(moduleId);
  const { enqueueSnackbar } = useSnackbar();
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
  });

  const { mutateAsync: createModule, isPending: moduleCreateLoading, error: moduleCreateError } = useModuleCreate();
  const { mutateAsync: createHook, isPending: hookCreateLoading } = useHookCreate();
  const { mutateAsync: createCommand, isPending: commandCreateLoading } = useCommandCreate();
  const { mutateAsync: createCronJob, isPending: cronJobCreateLoading } = useCronJobCreate();
  const { mutateAsync: removeModule, isPending: moduleRemoveLoading } = useModuleRemove();

  const isLoading =
    moduleCreateLoading || hookCreateLoading || commandCreateLoading || cronJobCreateLoading || moduleRemoveLoading;

  if (isPending) {
    return;
  }

  if (!mod) {
    enqueueSnackbar('Module not found', { variant: 'default', type: 'error' });
    return;
  }

  if (moduleCreateError && !error) {
    const err = errors.defineErrorType(moduleCreateError);

    if (err instanceof errors.UniqueConstraintError) {
      setError('Module name already exists');
    } else {
      setError('Failed to copy module');
    }
  }

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = async ({ name }) => {
    setError(null);
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
          Promise.all(
            mod.hooks.map((hook) =>
              createHook({
                moduleId: createdModule.id,
                name: hook.name,
                eventType: hook.eventType,
                regex: hook.regex ?? '',
                function: hook.function.code,
              })
            )
          ),
          Promise.all(
            mod.commands.map((command) =>
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
              })
            )
          ),
          Promise.all(
            mod.cronJobs.map((cronJob) =>
              createCronJob({
                moduleId: createdModule.id,
                name: cronJob.name,
                temporalValue: cronJob.temporalValue,
                function: cronJob.function.code,
              })
            )
          ),
        ]);
        onSuccess && onSuccess(createdModule.id);
      }
    } catch (error) {
      await removeModule({ id: createdModule.id });
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
      {error && <FormError message={error} />}
    </>
  );
};
