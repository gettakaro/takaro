import { SelectField } from '@takaro/lib-components';
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
