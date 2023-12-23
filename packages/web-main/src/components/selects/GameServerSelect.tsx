import { Select } from '@takaro/lib-components';
import { useGameServers } from 'queries/gameservers';
import { FC } from 'react';
import { GameServerOutputDTOTypeEnum } from '@takaro/apiclient';
import { SelectProps } from '.';

const gameTypeMap = {
  [GameServerOutputDTOTypeEnum.Mock]: 'Mock (testing purposes)',
  [GameServerOutputDTOTypeEnum.Rust]: 'Rust',
  [GameServerOutputDTOTypeEnum.Sevendaystodie]: '7 Days to die',
};

export const GameServerSelect: FC<SelectProps> = ({ control, isLoading, name }) => {
  const { data, isLoading: isLoadingData } = useGameServers();

  if (isLoadingData) {
    // TODO: better loading state
    return <div>loading...</div>;
  }

  // flatten pages into a single array
  const gameServers = data?.pages.flatMap((page) => page.data);

  if (!gameServers) {
    return <div>no game servers</div>;
  }

  return (
    <Select
      control={control}
      name={name}
      label="Game Server"
      enableFilter={gameServers.length > 6}
      required
      loading={isLoading}
      render={(selectedIndex) => <div>{gameServers[selectedIndex]?.name ?? 'Select...'}</div>}
    >
      <Select.OptionGroup label="Games">
        {gameServers.map(({ name, id, type }) => (
          <Select.Option key={`select-${name}`} value={id}>
            <div>
              <span>
                {name} ({gameTypeMap[type]})
              </span>
            </div>
          </Select.Option>
        ))}
      </Select.OptionGroup>
    </Select>
  );
};
