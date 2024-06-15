import { SelectField, styled } from '@takaro/lib-components';
import { FC } from 'react';
import { CustomSelectProps } from '.';
import { gameServerModuleInstallationsOptions } from 'queries/gameserver';
import { ModuleInstallationOutputDTO } from '@takaro/apiclient';
import { useQuery } from '@tanstack/react-query';

const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;

  span {
    margin-left: ${({ theme }) => theme.spacing['1']};
  }
`;

type InstalledModuleSelectProps = CustomSelectProps & { gameServerId: string };
export const InstalledModuleSelect: FC<InstalledModuleSelectProps> = ({
  control,
  name,
  loading,
  description,
  readOnly,
  inPortal,
  disabled,
  label = 'Installed module',
  size,
  required,
  hint,
  gameServerId,
  multiple,
}) => {
  if (gameServerId === undefined) {
    throw new Error('InstalledModuleSelect: gameServerId is undefined');
  }

  const { data: modules, isLoading: isLoadingData } = useQuery(gameServerModuleInstallationsOptions(gameServerId));

  if (isLoadingData) {
    // TODO: better loading state
    return <div>loading...</div>;
  }

  if (!modules?.length) {
    return <div>no modules found</div>;
  }

  return (
    <InstalledModuleSelectView
      required={required}
      loading={loading}
      control={control}
      name={name}
      label={label}
      description={description}
      readOnly={readOnly}
      inPortal={inPortal}
      disabled={disabled}
      size={size}
      hint={hint}
      modules={modules}
      multiple={multiple}
    />
  );
};

export type InstalledModuleSelectViewProps = CustomSelectProps & { modules: ModuleInstallationOutputDTO[] };

export const InstalledModuleSelectView: FC<InstalledModuleSelectViewProps> = ({
  control,
  name,
  label,
  description,
  readOnly,
  hint,
  size,
  loading,
  disabled,
  inPortal,
  required,
  modules,
  multiple,
}) => {
  return (
    <SelectField
      control={control}
      name={name}
      label={label}
      description={description}
      readOnly={readOnly}
      hint={hint}
      disabled={disabled}
      size={size}
      required={required}
      inPortal={inPortal}
      loading={loading}
      multiple={multiple}
      render={(selectedItems) => {
        if (selectedItems.length === 0) {
          return <div>Select...</div>;
        }
        return <div>{selectedItems[0].label}</div>;
      }}
    >
      <SelectField.OptionGroup>
        {modules.map(({ id, moduleId }) => (
          <SelectField.Option key={`select-${name}-${id}`} value={moduleId} label={moduleId}>
            <Inner>
              <span>{moduleId}</span>
            </Inner>
          </SelectField.Option>
        ))}
      </SelectField.OptionGroup>
    </SelectField>
  );
};
