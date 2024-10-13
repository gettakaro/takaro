import { PaginationProps, SelectQueryField } from '@takaro/lib-components';
import { FC, useState } from 'react';
import { CustomSelectProps } from '.';
import { modulesInfiniteQueryOptions } from 'queries/module';
import { ModuleOutputDTO } from '@takaro/apiclient';
import { useInfiniteQuery } from '@tanstack/react-query';

export const ModuleSelectQueryField: FC<CustomSelectProps> = ({
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
  const [moduleName, setModuleName] = useState('');
  const {
    data,
    isLoading: isLoadingData,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery(modulesInfiniteQueryOptions({ search: { name: [moduleName] }, limit: 20 }));

  if (isLoadingData) {
    // TODO: better loading state
    return <div>loading...</div>;
  }

  const modules = data?.pages.flatMap((page) => page.data);
  if (!modules || modules.length === 0) {
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
      fetchNextPage={fetchNextPage}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      setModuleName={setModuleName}
    />
  );
};

export type ModuleSelectViewProps = CustomSelectProps &
  PaginationProps & {
    modules: ModuleOutputDTO[];
    setModuleName: (value: string) => void;
  };
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
  setModuleName,
  isFetching,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}) => {
  return (
    <SelectQueryField
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
      handleInputValueChange={setModuleName}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      render={(selectedModules) => {
        if (selectedModules.length === 0) {
          return <p>Select module...</p>;
        }
        return selectedModules.map((gameServer) => gameServer.label).join(', ');
      }}
    >
      <SelectQueryField.OptionGroup>
        {modules.map(({ id, name }) => (
          <SelectQueryField.Option key={`select-${selectName}-${id}`} value={id} label={name}>
            <span>{name}</span>
          </SelectQueryField.Option>
        ))}
      </SelectQueryField.OptionGroup>
    </SelectQueryField>
  );
};
