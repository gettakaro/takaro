import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, FormError, SelectField, UnControlledSelectField } from '@takaro/lib-components';
import { useModuleExport } from 'queries/module';
import { FC, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { SmallModuleVersionOutputDTO } from '@takaro/apiclient';
import { useSnackbar } from 'notistack';
import { AiOutlineCheck as CheckMarkIcon } from 'react-icons/ai';
import { RequiredDialogOptions } from '.';

interface ModuleExportDialogProps extends RequiredDialogOptions {
  moduleId: string;
  moduleName: string;
  moduleVersions: SmallModuleVersionOutputDTO[];
}

const validationSchema = z.object({
  versionIds: z.array(z.string()),
});

export const ModuleExportDialog: FC<ModuleExportDialogProps> = ({
  moduleId,
  moduleName,
  moduleVersions,
  ...dialogOptions
}) => {
  const { mutateAsync, isPending: isExporting } = useModuleExport();
  const [error, setError] = useState<string | null>(null);
  const defaultSelectedVersion = moduleVersions.find((v) => v.tag === 'latest')!;
  const { enqueueSnackbar } = useSnackbar();

  const { control, handleSubmit } = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
    values: {
      versionIds: [defaultSelectedVersion.id],
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = async ({ versionIds }) => {
    try {
      setError(null);
      const data = await mutateAsync({ moduleId, options: { versionIds } });

      if (data) {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        enqueueSnackbar('Exported ready for download', {
          autoHideDuration: 20000, // 20s
          anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
          variant: 'drawer',
          children: (
            <div>
              <h4>Module Ready</h4>
              <p>
                <CheckMarkIcon />{' '}
                <a href={url} download={`${moduleName}-${Date.now()}.json`}>
                  {' '}
                  Download now
                </a>
              </p>
            </div>
          ),
        });
        dialogOptions.onOpenChange(false);
      }
    } catch {
      setError('Failed to export module!');
    }
  };

  return (
    <Dialog {...dialogOptions}>
      <Dialog.Content>
        <Dialog.Heading size={4}>
          Export module: <span style={{ textTransform: 'capitalize' }}>{moduleName}</span>{' '}
        </Dialog.Heading>
        <Dialog.Body size="medium">
          <form onSubmit={handleSubmit(onSubmit)}>
            <SelectField
              label="Versions"
              description="The module versions you want to be part of the export."
              name="versionIds"
              control={control}
              multiple
              render={(selectedVersions) => {
                if (selectedVersions.length === 0) {
                  return <p>Select module...</p>;
                }
                return selectedVersions.map((selectedVersion) => selectedVersion.label).join(', ');
              }}
            >
              <UnControlledSelectField.OptionGroup>
                {moduleVersions.map((version) => (
                  <UnControlledSelectField.Option key={version.id} value={version.id} label={version.tag}>
                    <div>
                      <span>{version.tag}</span>
                    </div>
                  </UnControlledSelectField.Option>
                ))}
              </UnControlledSelectField.OptionGroup>
            </SelectField>
            {error && <FormError error={error} />}
            <Button fullWidth type="submit" text="Export module" isLoading={isExporting} />
          </form>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
