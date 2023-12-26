import { Select, styled } from '@takaro/lib-components';
import { FC } from 'react';
import { CustomSelectProps } from '.';
import { useModules } from 'queries/modules';

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
    <Select
      control={control}
      name={selectName}
      label={label}
      description={description}
      readOnly={readOnly}
      hint={hint}
      disabled={disabled}
      size={size}
      inPortal={inPortal}
      loading={loading}
      render={(selectedIndex) => {
        if (selectedIndex === undefined || selectedIndex === -1) {
          return <div>Select...</div>;
        }
        return <div>{modules[selectedIndex].name}</div>;
      }}
    >
      <Select.OptionGroup>
        {modules.map(({ id, name }) => (
          <Select.Option key={`select-${selectName}-${id}`} value={id} label={name}>
            <Inner>
              <span>{name}</span>
            </Inner>
          </Select.Option>
        ))}
      </Select.OptionGroup>
    </Select>
  );
};
