import { UnControlledSelectQueryField, SelectQueryField, styled } from '@takaro/lib-components';
import { FC, useState } from 'react';
import { rolesInfiniteQueryOptions } from '../../queries/role';
import { useInfiniteQuery } from '@tanstack/react-query';

const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
`;

export interface UnControlledRoleSelectQueryFieldProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  name: string;
  label?: string;
  loading?: boolean;
  required?: boolean;
  hint?: string;
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'huge';
  disabled?: boolean;
  description?: string;
  readOnly?: boolean;
  canClear?: boolean;
  multiple?: boolean;
  includeSpecialRoles?: boolean;
  hasError?: boolean;
}

export const UnControlledRoleSelectQueryField: FC<UnControlledRoleSelectQueryFieldProps> = ({
  value,
  onChange,
  name,
  required,
  disabled,
  description,
  readOnly,
  canClear,
  multiple,
  includeSpecialRoles = false,
  hasError,
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
    return <div>loading...</div>;
  }

  if (!data || data.pages.length === 0) {
    return <div>no roles</div>;
  }

  const roles = data.pages.flatMap((page) => page.data);
  const filteredRoles = includeSpecialRoles
    ? roles
    : roles.filter((role) => role.name !== 'User' && role.name !== 'Player');

  const renderSelectedItems = (selectedItems: any) => {
    if (selectedItems.length === 0) {
      return <div>Select role...</div>;
    }

    if (multiple) {
      const selectedItemValues = selectedItems.map((item: any) => item.value);
      const selectedRoles = filteredRoles.filter((role) => selectedItemValues.includes(role.id));
      const selectedRoleNames = selectedRoles.map((role) => role.name);
      return <div>{selectedRoleNames.join(', ')}</div>;
    }

    const selectedRole = filteredRoles.find((role) => role.id === selectedItems[0]?.value);
    return <div>{selectedRole?.name || 'Unknown role'}</div>;
  };

  const roleOptions = (
    <>
      <UnControlledSelectQueryField.OptionGroup label="Custom">
        {filteredRoles
          .filter((role) => !role.system)
          .map(({ name, id }) => (
            <SelectQueryField.Option key={`select-${id}`} value={id} label={name}>
              <Inner>
                <span>{name}</span>
              </Inner>
            </SelectQueryField.Option>
          ))}
      </UnControlledSelectQueryField.OptionGroup>

      <UnControlledSelectQueryField.OptionGroup label="System">
        {filteredRoles
          .filter((role) => role.system)
          .map(({ name, id }) => (
            <SelectQueryField.Option key={`select-${id}`} value={id} label={name}>
              <Inner>
                <span>{name}</span>
              </Inner>
            </SelectQueryField.Option>
          ))}
      </UnControlledSelectQueryField.OptionGroup>
    </>
  );

  if (multiple) {
    return (
      <UnControlledSelectQueryField
        id={name}
        name={name}
        value={(Array.isArray(value) ? value : []) as string[]}
        onChange={onChange}
        hasDescription={!!description}
        hasError={!!hasError}
        readOnly={readOnly}
        disabled={disabled}
        required={required}
        multiple={true}
        canClear={canClear}
        placeholder="Search for role..."
        handleInputValueChange={(value) => setRoleName(value)}
        isLoadingData={isLoadingData}
        isFetching={isFetching}
        hasNextPage={hasNextPage || false}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        optionCount={data?.pages[0]?.meta.total}
        render={renderSelectedItems}
      >
        {roleOptions}
      </UnControlledSelectQueryField>
    );
  }

  return (
    <UnControlledSelectQueryField
      id={name}
      name={name}
      value={(typeof value === 'string' ? value : '') as string}
      onChange={onChange}
      hasDescription={!!description}
      hasError={!!hasError}
      readOnly={readOnly}
      disabled={disabled}
      required={required}
      multiple={false}
      canClear={canClear}
      placeholder="Search for role..."
      handleInputValueChange={(value) => setRoleName(value)}
      isLoadingData={isLoadingData}
      isFetching={isFetching}
      hasNextPage={hasNextPage || false}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      optionCount={data?.pages[0]?.meta.total}
      render={renderSelectedItems}
    >
      {roleOptions}
    </UnControlledSelectQueryField>
  );
};
