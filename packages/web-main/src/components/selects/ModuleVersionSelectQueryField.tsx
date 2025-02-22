import { PaginationProps, SelectQueryField, Skeleton, UnControlledSelectQueryField } from '@takaro/lib-components';
import { FC } from 'react';
import { CustomSelectQueryProps, CustomUncontrolledSelectQueryFieldProps } from '.';
import { useInfiniteQuery } from '@tanstack/react-query';
import { moduleTagsInfiniteQueryOptions } from '../../queries/module';
import { SmallModuleVersionOutputDTO } from '@takaro/apiclient';

interface ModuleVersionSelectQueryFieldProps extends CustomSelectQueryProps {
  moduleId: string;
  filter?: (version: SmallModuleVersionOutputDTO) => boolean;
}

export const ModuleVersionSelectQueryField: FC<ModuleVersionSelectQueryFieldProps> = ({
  label = 'Module versions',
  control,
  name,
  hint,
  size,
  disabled,
  readOnly,
  required,
  description,
  moduleId,
  multiple,
  canClear,
  filter,
  placeholder,
}) => {
  const { data, isFetching, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } = useInfiniteQuery(
    moduleTagsInfiniteQueryOptions({ moduleId, limit: 20 }, { enabled: false }),
  );

  let smallVersions = data?.pages.flatMap((page) => page.data) ?? [];
  if (filter) {
    smallVersions = smallVersions.filter(filter);
  }

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      refetch();
    }
  };

  return (
    <ModuleVersionSelectView
      required={required}
      control={control}
      readOnly={readOnly}
      description={description}
      size={size}
      disabled={disabled}
      hint={hint}
      name={name}
      label={label}
      moduleVersions={smallVersions}
      multiple={multiple}
      fetchNextPage={fetchNextPage}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      canClear={canClear}
      onOpenChange={handleOpen}
      placeholder={placeholder}
    />
  );
};

type ModuleVersionSelectViewProps = CustomSelectQueryProps &
  PaginationProps & { moduleVersions: SmallModuleVersionOutputDTO[] };

export const ModuleVersionSelectView: FC<ModuleVersionSelectViewProps> = ({
  control,
  readOnly,
  description,
  size,
  disabled,
  hint,
  required,
  label,
  canClear,
  multiple,
  isFetchingNextPage,
  isFetching,
  hasNextPage,
  fetchNextPage,
  onOpenChange,
  name,
  moduleVersions,
  placeholder = 'Select version...',
}) => {
  return (
    <SelectQueryField
      control={control}
      name={name}
      label={label}
      description={description}
      readOnly={readOnly}
      hint={hint}
      disabled={disabled}
      size={size}
      required={required}
      multiple={multiple}
      onOpenChange={onOpenChange}
      canClear={canClear}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      render={(selectedVersions) => {
        if (selectedVersions.length === 0) {
          return <div>{placeholder}</div>;
        }
        return <div>{selectedVersions.map((version) => version.label).join(', ')}</div>;
      }}
    >
      <SelectQueryField.OptionGroup>
        {moduleVersions.map(({ tag, id }) => (
          <SelectQueryField.Option key={id} value={tag} label={tag}>
            <div>
              <span>{tag}</span>
            </div>
          </SelectQueryField.Option>
        ))}
      </SelectQueryField.OptionGroup>
    </SelectQueryField>
  );
};

export const UnControlledModuleVersionSelectQueryField: FC<
  CustomUncontrolledSelectQueryFieldProps & { moduleId: string }
> = ({ value, handleInputValueChange, onChange, canClear, placeholder, name, moduleId, readOnly }) => {
  const {
    data,
    isLoading: isLoadingData,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery(moduleTagsInfiniteQueryOptions({ moduleId, limit: 20 }));

  if (isLoadingData) {
    return <Skeleton variant="rectangular" width="100%" height="25px" />;
  }

  const moduleVersions = data?.pages.flatMap((page) => page.data);
  if (!moduleVersions) {
    return <div>no modules found</div>;
  }

  return (
    <UnControlledSelectQueryField
      id={name}
      hasDescription={false}
      hasError={false}
      value={value}
      handleInputValueChange={handleInputValueChange}
      readOnly={readOnly}
      name={name}
      multiple={false}
      onChange={onChange}
      canClear={canClear}
      placeholder={placeholder}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      render={(selectedVersions) => {
        if (selectedVersions.length === 0) {
          return <div>Select version...</div>;
        }
        return <div>{selectedVersions.map((version) => version.label).join(', ')}</div>;
      }}
    >
      <UnControlledSelectQueryField.OptionGroup>
        {moduleVersions.map((moduleVersion) => (
          <SelectQueryField.Option key={moduleVersion.id} value={moduleVersion.tag} label={moduleVersion.tag}>
            <div>
              <span>{moduleVersion.tag}</span>
            </div>
          </SelectQueryField.Option>
        ))}
      </UnControlledSelectQueryField.OptionGroup>
    </UnControlledSelectQueryField>
  );
};
