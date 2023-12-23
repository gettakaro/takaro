import { Select, Chip } from '@takaro/lib-components';
import { FC } from 'react';
import { SelectProps } from '.';
import { useRoles } from 'queries/roles';

export const GameServerSelect: FC<SelectProps> = ({ control, isLoading, name }) => {
  const { data, isLoading: isLoadingData } = useRoles();

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
    <Select
      control={control}
      name={name}
      label="Game Server"
      required
      enableFilter={roles.length > 10}
      loading={isLoading}
      render={(selectedIndex) => <div>{roles[selectedIndex]?.name ?? 'Select...'}</div>}
    >
      <Select.OptionGroup label="Games">
        {roles.map(({ name, id, system }) => (
          <Select.Option key={`select-${name}`} value={id}>
            <div>
              <span>{name}</span> && {system} && <Chip color="primary" label="System" />
            </div>
          </Select.Option>
        ))}
      </Select.OptionGroup>
    </Select>
  );
};
