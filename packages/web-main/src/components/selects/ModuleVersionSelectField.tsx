import { SelectField, UnControlledSelectField } from '@takaro/lib-components';
import { FC } from 'react';
import { CustomSelectProps } from '.';
import { SmallModuleVersionOutputDTO } from '@takaro/apiclient';

interface ModuleVersionSelectFieldProps extends CustomSelectProps {
  options: SmallModuleVersionOutputDTO[];
}

export const ModuleVersionSelectField: FC<ModuleVersionSelectFieldProps> = ({
  label = 'Module versions',
  control,
  name,
  hint,
  size,
  loading,
  disabled,
  readOnly,
  required,
  description,
  options,
  multiple,
}) => {
  return (
    <SelectField
      label={label}
      control={control}
      name={name}
      hint={hint}
      loading={loading}
      disabled={disabled}
      readOnly={readOnly}
      multiple={multiple}
      required={required}
      description={description}
      size={size}
      render={(selectedVersions) => {
        if (selectedVersions.length === 0) {
          return <div>Select version...</div>;
        }

        if (selectedVersions.length === 1) {
          const selectedVersion = options.find((version) => version.id === selectedVersions[0]?.value);

          if (selectedVersion) {
            return <div>{selectedVersion.tag}</div>;
          }
        }
        return <div>{selectedVersions.map((version) => version.label).join(', ')}</div>;
      }}
    >
      <SelectField.OptionGroup>
        {options.map(({ tag, id }) => (
          <SelectField.Option key={id} value={id} label={tag}>
            <div>
              <span>{tag}</span>
            </div>
          </SelectField.Option>
        ))}
      </SelectField.OptionGroup>
    </SelectField>
  );
};

interface UncontrolledModuleVersionTagSelectFieldProps {
  options: SmallModuleVersionOutputDTO[];
  onChange: (versionId: string) => void;
  value: string;
}
export const UnControlledModuleVersionTagSelectField: FC<UncontrolledModuleVersionTagSelectFieldProps> = ({
  onChange,
  options,
  value,
}) => {
  return (
    <UnControlledSelectField
      id="module-version-tag-select"
      name="module-version-tag-select"
      onChange={onChange}
      multiple={false}
      render={(selectedItems) => {
        if (selectedItems.length > 0) {
          if (selectedItems[0].value === 'latest') {
            return (
              <div>
                <span>Latest version</span>
              </div>
            );
          }
          return (
            <div>
              <span>{selectedItems[0].value}</span>
            </div>
          );
        }
        return <span>Select a version</span>;
      }}
      value={value}
      hasError={false}
      hasDescription={false}
    >
      <UnControlledSelectField.OptionGroup>
        {options.map((version) => {
          return (
            <UnControlledSelectField.Option key={version.id} value={version.tag} label={version.tag}>
              <div>{version.tag}</div>
            </UnControlledSelectField.Option>
          );
        })}
      </UnControlledSelectField.OptionGroup>
    </UnControlledSelectField>
  );
};
