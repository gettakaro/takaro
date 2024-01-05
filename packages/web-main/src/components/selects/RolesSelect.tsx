import { SelectField, styled } from '@takaro/lib-components';
import { FC } from 'react';
import { CustomSelectProps } from '.';
import { useRoles } from 'queries/roles';

const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
`;

export const RolesSelect: FC<CustomSelectProps> = ({
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
  const { data, isLoading: isLoadingData } = useRoles({ sortBy: 'system', sortDirection: 'asc' });

  if (isLoadingData) {
    // TODO: better loading state
    return <div>loading...</div>;
  }

  // flatten pages into a single array
  const roles = data?.pages.flatMap((page) => page.data);

  if (!roles) {
    return <div>no game servers</div>;
  }

  return (
    <SelectField
      control={control}
      name={name}
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
