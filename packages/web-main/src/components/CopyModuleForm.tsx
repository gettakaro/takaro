import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import { Button, TextField, FormError, Alert } from '@takaro/lib-components';
import { FC } from 'react';
import { AiOutlineCopy as CopyIcon } from 'react-icons/ai';

import { moduleQueryOptions, useModuleCreate } from 'queries/module';
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
  const { data: mod } = useQuery(moduleQueryOptions(moduleId));
  const { enqueueSnackbar } = useSnackbar();

  const { control, handleSubmit } = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
  });

  const {
    mutate: createModule,
    isPending: moduleCreateLoading,
    error: moduleCreateError,
    isSuccess,
  } = useModuleCreate();

  if (!mod) {
    enqueueSnackbar('Module not found', { variant: 'default', type: 'error' });
    return;
  }

  const { latestVersion } = mod;
  if (isSuccess) {
    onSuccess && onSuccess(moduleId);
  }

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = async ({ name }) => {
    createModule({
      name,
      latestVersion: {
        hooks: latestVersion.hooks.map((hook) => ({
          versionId: latestVersion.id,
          name: hook.name,
          eventType: hook.eventType,
          regex: hook.regex,
          function: hook.function.code,
        })),
        commands: latestVersion.commands.map((command) => ({
          versionId: latestVersion.id,
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
        })),
        functions: latestVersion.functions.map((f) => ({
          name: f.name,
          code: f.code,
        })),
        cronJobs: latestVersion.cronJobs.map((cronJob) => ({
          versionId: latestVersion.id,
          name: cronJob.name,
          temporalValue: cronJob.temporalValue,
          function: cronJob.function.code,
        })),
        configSchema: latestVersion.configSchema,
        permissions: latestVersion.permissions.map((perm) => ({
          description: perm.description,
          permission: perm.permission,
          friendlyName: `${mod.name}_${perm.friendlyName}`,
          canHaveCount: perm.canHaveCount,
        })),
        uiSchema: latestVersion.uiSchema,
        description: latestVersion.description,
      },
    });
  };

  return (
    <>
      <Alert
        variant="warning"
        text="The new module will only have the version tagged 'latest'. This includes all hooks, commands, and cron jobs and configuration."
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          control={control}
          name="name"
          placeholder="Module Name"
          label="Module Name"
          description="Name of the new module"
          required
          loading={moduleCreateLoading}
        />
        <Button isLoading={moduleCreateLoading} type="submit" icon={<CopyIcon />} text="Copy Module" fullWidth />
      </form>

      <div style={{ height: '10px' }} />
      {moduleCreateError && <FormError error={moduleCreateError} />}
    </>
  );
};
