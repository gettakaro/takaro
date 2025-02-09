import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, TextField, FormError, SelectField } from '@takaro/lib-components';
import { FC } from 'react';
import { AiOutlineCopy as CopyIcon } from 'react-icons/ai';

import { useModuleExport, useModuleImport } from '../queries/module';
import { moduleNameShape } from '../routes/_auth/_global/-modules/ModuleForm/validationSchema';
import { ModuleOutputDTO } from '@takaro/apiclient';

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
      versions: mod.versions.map((v) => v.id),
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
        <SelectField
          control={control}
          name="versions"
          label="Versions"
          multiple
          required
          render={(selectedItems) => {
            if (selectedItems.length === 0) {
              return <div>Select...</div>;
            }
            return <div>{selectedItems[0].label}</div>;
          }}
        >
          <SelectField.OptionGroup>
            {mod.versions.map((smallVersion) => (
              <SelectField.Option
                key={`version-select-${smallVersion.id}`}
                value={smallVersion.id}
                label={smallVersion.tag}
              >
                <div>
                  <span>{smallVersion.tag}</span>
                </div>
              </SelectField.Option>
            ))}
          </SelectField.OptionGroup>
        </SelectField>
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
