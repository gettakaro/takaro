import { PaginationProps, SelectQueryField, styled } from '@takaro/lib-components';
import { FC, useState } from 'react';
import { CustomSelectProps } from '.';
import { rolesInfiniteQueryOptions } from '../../queries/role';
import { RoleOutputDTO } from '@takaro/apiclient';
import { useInfiniteQuery } from '@tanstack/react-query';

const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
`;

export const RoleSelectQueryField: FC<CustomSelectProps> = ({
  control,
  name,
  loading,
  required,
  hint,
  size,
  label = 'Role',
  disabled,
  description,
  readOnly,
  canClear,
  multiple,
}) => {
  const [roleName, setRoleName] = useState<string>('');
  const {
    data,
    isLoading: isLoadingData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteQuery(
    rolesInfiniteQueryOptions({
      sortBy: 'system',
      sortDirection: 'asc',
      limit: 20,
      search: { name: [roleName] },
    }),
  );

  if (isLoadingData) {
    // TODO: better loading state
    return <div>loading...</div>;
  }

  if (!data || data.pages.length === 0) {
    return <div>no roles</div>;
  }

  const roles = data.pages.flatMap((page) => page.data);
  const filteredRoles = roles.filter((role) => role.name !== 'User' && role.name !== 'Player');

  return (
    <RoleSelectView
      control={control}
      name={name}
      roles={filteredRoles}
      readOnly={readOnly}
      description={description}
      size={size}
      disabled={disabled}
      hint={hint}
      required={required}
      loading={loading}
      label={label}
      canClear={canClear}
      multiple={multiple}
      setRoleName={setRoleName}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isFetching={isFetching}
    />
  );
};

export type RoleSelectViewProps = CustomSelectProps &
  PaginationProps & {
    roles: RoleOutputDTO[];
    isLoadingData?: boolean;
    setRoleName: (roleName: string) => void;
  };
export const RoleSelectView: FC<RoleSelectViewProps> = ({
  control,
  roles,
  name: selectName,
  readOnly,
  description,
  size,
  disabled,
  hint,
  required,
  canClear,
  loading,
  label,
  multiple,
  isFetching,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  setRoleName,
}) => {
  return (
    <SelectQueryField
      name={selectName}
      control={control}
      debounce={500}
      label={label}
      readOnly={readOnly}
      hint={hint}
      disabled={disabled}
      size={size}
      description={description}
      required={required}
      loading={loading}
      canClear={canClear}
      multiple={multiple}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      handleInputValueChange={(value) => setRoleName(value)}
      render={(selectedItems) => {
        if (selectedItems.length === 0) {
          return <div>Select role...</div>;
        }

        if (multiple) {
          const selectedItemValues = selectedItems.map((item) => item.value);
          const selectedRoles = roles.filter((role) => selectedItemValues.includes(role.id));
          const selectedRoleNames = selectedRoles.map((role) => role.name);
          return <div>{selectedRoleNames.join(', ')}</div>;
        }

        const selectedRole = roles.find((role) => role.id === selectedItems[0]?.value)!;
        return <div>{selectedRole.name}</div>;
      }}
    >
      <SelectQueryField.OptionGroup label="Custom">
        {roles
          .filter((role) => !role.system)
          .map(({ name, id }) => (
            <SelectQueryField.Option key={`select-${name}`} value={id} label={name}>
              <Inner>
                <span>{name}</span>
              </Inner>
            </SelectQueryField.Option>
          ))}
      </SelectQueryField.OptionGroup>

      <SelectQueryField.OptionGroup label="System">
        {roles
          .filter((role) => role.system)
          .map(({ name, id }) => (
            <SelectQueryField.Option key={`select-${name}`} value={id} label={name}>
              <Inner>
                <span>{name}</span>
              </Inner>
            </SelectQueryField.Option>
          ))}
      </SelectQueryField.OptionGroup>
    </SelectQueryField>
  );
};
