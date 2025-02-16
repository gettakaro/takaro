import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, TextField, FormError } from '@takaro/lib-components';
import { FC } from 'react';
import { AiOutlineCopy as CopyIcon } from 'react-icons/ai';

import { useModuleExport, useModuleImport } from '../queries/module';
import { moduleNameShape } from '../util/validationShapes';
import { ModuleOutputDTO } from '@takaro/apiclient';
import { ModuleVersionSelectQueryField } from './selects/ModuleVersionSelectQueryField';

const validationSchema = z.object({
  name: moduleNameShape,
  versions: z.array(z.string()),
});

interface CopyModuleFormProps {
  mod: ModuleOutputDTO;
  onSuccess?: () => void;
}

export const CopyModuleForm: FC<CopyModuleFormProps> = ({ mod, onSuccess }) => {
  const { control, handleSubmit } = useForm<z.infer<typeof validationSchema>>({
    values: {
      name: mod.name + ' Copy',
      versions: [],
    },
    resolver: zodResolver(validationSchema),
  });

  const { mutateAsync: importModule, isPending: moduleImportLoading, error: moduleImportError } = useModuleImport();
  const { mutateAsync: exportModule, isPending: moduleExportLoading, error: moduleExportError } = useModuleExport();

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = async ({ name, versions }) => {
    try {
      const exportedModule = await exportModule({
        moduleId: mod.id,
        options: {
          versionIds: versions,
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          control={control}
          name="name"
          placeholder="Module Name"
          label="Module Name"
          required
          loading={moduleImportLoading || moduleExportLoading}
        />
        <ModuleVersionSelectQueryField name="versions" label="Versions" control={control} multiple moduleId={mod.id} />
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
