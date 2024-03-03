import { SelectField, styled } from '@takaro/lib-components';
import { FC } from 'react';
import { CustomSelectProps } from '.';
import { rolesOptions } from 'queries/roles';
import { RoleOutputDTO } from '@takaro/apiclient';
import { useQuery } from '@tanstack/react-query';

const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
`;

export const RoleSelect: FC<CustomSelectProps> = ({
  control,
  name,
  loading,
  required,
  hint,
  size,
  label = 'Role',
  disabled,
  inPortal,
  description,
  readOnly,
}) => {
  const { data: roles, isLoading: isLoadingData } = useQuery(rolesOptions({ sortBy: 'system', sortDirection: 'asc' }));

  if (isLoadingData) {
    // TODO: better loading state
    return <div>loading...</div>;
  }

  if (!roles || roles.data.length === 0) {
    return <div>no game servers</div>;
  }

  return (
    <RoleSelectView
      control={control}
      name={name}
      roles={roles.data}
      readOnly={readOnly}
      description={description}
      size={size}
      disabled={disabled}
      inPortal={inPortal}
      hint={hint}
      required={required}
      loading={loading}
      label={label}
    />
  );
};

export type RoleSelectViewProps = CustomSelectProps & { roles: RoleOutputDTO[] };
export const RoleSelectView: FC<RoleSelectViewProps> = ({
  control,
  roles,
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
      readOnly={readOnly}
      hint={hint}
      disabled={disabled}
      size={size}
      inPortal={inPortal}
      description={description}
      required={required}
      enableFilter={roles.length > 10}
      loading={loading}
      render={(selectedItems) => {
        if (selectedItems.length === 0) {
          return <div>Select...</div>;
        }
        const selectedRole = roles.find((role) => role.id === selectedItems[0]?.value)!;
        return <div>{selectedRole.name}</div>;
      }}
    >
      <SelectField.OptionGroup label="Custom">
        {roles
          .filter((role) => !role.system)
          .map(({ name, id }) => (
            <SelectField.Option key={`select-${name}`} value={id} label={name}>
              <Inner>
                <span>{name}</span>
              </Inner>
            </SelectField.Option>
          ))}
      </SelectField.OptionGroup>

      <SelectField.OptionGroup label="System">
        {roles
          .filter((role) => role.system)
          .map(({ name, id }) => (
            <SelectField.Option key={`select-${name}`} value={id} label={name}>
              <Inner>
                <span>{name}</span>
              </Inner>
            </SelectField.Option>
          ))}
      </SelectField.OptionGroup>
    </SelectField>
  );
};
