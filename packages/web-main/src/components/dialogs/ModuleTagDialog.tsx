import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Chip, Dialog, FormError, SelectField } from '@takaro/lib-components';
import { useQuery } from '@tanstack/react-query';
import { moduleVersionsQueryOptions, useTagModule } from '../../queries/module';
import { FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import semver from 'semver';
import { RequiredDialogOptions } from '.';

interface ModuleTagDialogProps extends RequiredDialogOptions {
  moduleId: string;
  moduleName: string;
}

const validationSchema = z.object({
  versionLevel: z.enum(['major', 'minor', 'patch']),
});

export const ModuleTagDialog: FC<ModuleTagDialogProps> = ({ moduleId, moduleName, ...dialogOptions }) => {
  const { mutate: tagModule, isPending: isTagging, isSuccess: tagIsSuccess, error: tagError } = useTagModule();
  const { data: moduleVersions } = useQuery(
    moduleVersionsQueryOptions({
      filters: { moduleId: [moduleId] },
      limit: 1,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    }),
  );

  const { control, handleSubmit, watch } = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      versionLevel: 'patch',
    },
  });

  function nextVersion(version: string | undefined, versionLevel: 'major' | 'minor' | 'patch') {
    if (version && semver.valid(version)) {
      return semver.inc(version, versionLevel);
    }
    return semver.inc('0.0.0', versionLevel);
  }

  if (tagIsSuccess) {
    dialogOptions.onOpenChange(false);
  }

  const currentVersion = moduleVersions?.data[0].tag;
  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = ({ versionLevel }) => {
    tagModule({ moduleId, tag: nextVersion(currentVersion, versionLevel)! });
  };

  return (
    <Dialog {...dialogOptions}>
      <Dialog.Content>
        <Dialog.Heading size={4}>
          Tag Module: <span style={{ textTransform: 'capitalize' }}>{moduleName}</span>{' '}
        </Dialog.Heading>
        <Dialog.Body size="medium">
          <Alert
            variant="info"
            text="Tagging a module creates a new version of the module with the module's current state. Once a module is
            tagged, any further changes will not affect the tagged version."
          />
          <p>
            <Chip
              variant="outline"
              color="error"
              label={currentVersion == 'latest' ? 'None' : (currentVersion ?? 'undefined')}
            />
            {' -> '}
            <Chip
              variant="outline"
              color="success"
              label={nextVersion(currentVersion, watch('versionLevel')) ?? 'undefined'}
            />
          </p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <SelectField
              name="versionLevel"
              control={control}
              description="Takaro's tagging system is based on semantic versioning. Semantic versioning is a widely adopted system in software development. It is based on three numbers separated by dots to represent versions."
              label="Version level"
              multiple={false}
              render={(selectedItems) => {
                if (selectedItems.length === 0) {
                  return <div>Select...</div>;
                }
                return <div>{selectedItems[0].label}</div>;
              }}
            >
              <SelectField.OptionGroup>
                <SelectField.Option value="patch" label="Patch">
                  <div>
                    <span>Patch</span>
                    <p>
                      is increased when you make backwards-compatible bug fixes. E.g. Fixing a bug in the hook code that
                      doesn't require any changes for the user.
                    </p>
                  </div>
                </SelectField.Option>
                <SelectField.Option value="minor" label="Minor">
                  <div>
                    <span>Minor</span>
                    <p>
                      is increased when you add functionality in a backwards-compatible manner. E.g. Adding a new hook
                      that doesn't require input data.
                    </p>
                  </div>
                </SelectField.Option>
                <SelectField.Option value="major" label="Major">
                  <span>Major</span>
                  <p>
                    is increased when you make incompatible API changes, meaning people using the module will have to
                    make manual changes. E.g. Adding a new hook that requires input data.
                  </p>
                </SelectField.Option>
              </SelectField.OptionGroup>
            </SelectField>
            {tagError && <FormError error={tagError} />}
            <Button type="submit" isLoading={isTagging} fullWidth>
              Create tag
            </Button>
          </form>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};
