import { SelectField, styled } from '@takaro/lib-components';
import { FC } from 'react';
import { CustomSelectProps } from '.';
import { useModules } from 'queries/modules';
import { ModuleOutputDTO } from '@takaro/apiclient';

const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;

  span {
    margin-left: ${({ theme }) => theme.spacing['1']};
  }
`;

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
}) => {
  const { data, isLoading: isLoadingData } = useModules();

  if (isLoadingData) {
    // TODO: better loading state
    return <div>loading...</div>;
  }

  // flatten pages into a single array
  const modules = data?.pages.flatMap((page) => page.data);

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
      render={(selectedItems) => {
        if (selectedItems.length === 0) {
          return <div>Select...</div>;
        }
        return <div>{selectedItems[0].label}</div>;
      }}
    >
      <SelectField.OptionGroup>
        {modules.map(({ id, name }) => (
          <SelectField.Option key={`select-${selectName}-${id}`} value={id} label={name}>
            <Inner>
              <span>{name}</span>
            </Inner>
          </SelectField.Option>
        ))}
      </SelectField.OptionGroup>
    </SelectField>
  );
};
