import { SelectField } from '@takaro/lib-components';
import { FC } from 'react';
import { CustomSelectProps } from '.';
import { modulesQueryOptions } from 'queries/module';
import { ModuleOutputDTO } from '@takaro/apiclient';
import { useQuery } from '@tanstack/react-query';

export const ModuleSelect: FC<CustomSelectProps> = ({
  control,
  name: selectName,
  loading,
  description,
  readOnly,
  inPortal,
  disabled,
  size,
  hint,
  required,
  label = 'Module',
  canClear,
  multiple,
}) => {
  const { data, isLoading: isLoadingData } = useQuery(modulesQueryOptions());

  if (isLoadingData) {
    // TODO: better loading state
    return <div>loading...</div>;
  }

  const modules = data?.data ?? [];

  if (!modules?.length) {
    return <div>no modules found</div>;
  }

  return (
    <ModuleSelectView
      required={required}
      loading={loading}
      control={control}
      readOnly={readOnly}
      description={description}
      size={size}
      disabled={disabled}
      inPortal={inPortal}
      hint={hint}
      name={selectName}
      label={label}
      modules={modules}
      canClear={canClear}
      multiple={multiple}
    />
  );
};

export type ModuleSelectViewProps = CustomSelectProps & { modules: ModuleOutputDTO[] };
export const ModuleSelectView: FC<ModuleSelectViewProps> = ({
  control,
  modules,
  name: selectName,
  readOnly,
  description,
  size,
  disabled,
  inPortal,
  hint,
  required,
  loading,
  label,
  canClear,
  multiple,
}) => {
  return (
    <SelectField
      control={control}
      name={selectName}
      label={label}
      description={description}
      readOnly={readOnly}
      hint={hint}
      disabled={disabled}
      size={size}
      inPortal={inPortal}
      required={required}
      loading={loading}
      canClear={canClear}
      multiple={multiple}
      render={(selectedModules) => {
        if (selectedModules.length === 0) {
          return <p>Select module...</p>;
        }
        return selectedModules.map((gameServer) => gameServer.label).join(', ');
      }}
    >
      <SelectField.OptionGroup>
        {modules.map(({ id, name }) => (
          <SelectField.Option key={`select-${selectName}-${id}`} value={id} label={name}>
            <span>{name}</span>
          </SelectField.Option>
        ))}
      </SelectField.OptionGroup>
    </SelectField>
  );
};
