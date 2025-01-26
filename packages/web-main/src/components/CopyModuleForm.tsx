import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, TextField, FormError, Alert } from '@takaro/lib-components';
import { FC } from 'react';
import { AiOutlineCopy as CopyIcon } from 'react-icons/ai';

import { useModuleExport, useModuleImport } from 'queries/module';
import { moduleNameShape } from 'routes/_auth/_global/-modules/ModuleForm/validationSchema';
import { ModuleOutputDTO } from '@takaro/apiclient';

const validationSchema = z.object({
  name: moduleNameShape,
});

interface CopyModuleFormProps {
  mod: ModuleOutputDTO;
  onSuccess?: () => void;
}

export const CopyModuleForm: FC<CopyModuleFormProps> = ({ mod, onSuccess }) => {
  const { control, handleSubmit } = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
  });

  const { mutateAsync: importModule, isPending: moduleImportLoading, error: moduleImportError } = useModuleImport();
  const { mutateAsync: exportModule, isPending: moduleExportLoading, error: moduleExportError } = useModuleExport();

  const { latestVersion } = mod;

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = async ({ name }) => {
    try {
      const exportedModule = await exportModule({
        moduleId: mod.id,
        options: {
          versionIds: [latestVersion.id],
        },
      });

      exportedModule.name = name;
      await importModule(exportedModule);
      if (onSuccess) {
        onSuccess();
      }
    } catch (e) {
      console.error(e);
    }
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
          loading={moduleImportLoading || moduleExportLoading}
        />
        <Button
          isLoading={moduleImportLoading || moduleExportLoading}
          type="submit"
          icon={<CopyIcon />}
          text="Copy Module"
          fullWidth
        />
      </form>

      <div style={{ height: '10px' }} />
      {moduleExportError && <FormError error={moduleExportError} />}
      {moduleImportError && <FormError error={moduleImportError} />}
    </>
  );
};
