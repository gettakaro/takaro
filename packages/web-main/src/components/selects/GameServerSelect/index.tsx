import { SelectField, Skeleton, Tooltip } from '@takaro/lib-components';
import { gameServersOptions } from 'queries/gameservers';
import { FC } from 'react';
import { GameServerOutputDTO, GameServerOutputDTOTypeEnum } from '@takaro/apiclient';
import { CustomSelectProps } from '..';
import icon7d2d from './7d2d-icon.png';
import iconRust from './rust-icon.png';
import { FaLeaf as TakaroIcon } from 'react-icons/fa';
import { Inner, StatusDot } from './style';
import { useQuery } from '@tanstack/react-query';

const gameTypeMap = {
  [GameServerOutputDTOTypeEnum.Mock]: { icon: <TakaroIcon /> },
  [GameServerOutputDTOTypeEnum.Rust]: { icon: <img width="5px" height="5px" src={iconRust} /> },
  [GameServerOutputDTOTypeEnum.Sevendaystodie]: { icon: <img width="20px" height="20px" src={icon7d2d} /> },
};

export const GameServerSelect: FC<CustomSelectProps> = ({
  readOnly = false,
  hint,
  name: selectName,
  size,
  loading,
  label = 'Game server',
  control,
  disabled,
  inPortal,
  description,
  required,
}) => {
  const { data, isLoading: isLoadingData } = useQuery(gameServersOptions({ sortBy: 'type' }));
  const gameServers = data ?? [];

  if (isLoadingData) {
    return <Skeleton variant="text" width="100%" height="35px" />;
  }

  if (!gameServers) {
    return <div>no game servers</div>;
  }

  return (
    <GameServerSelectView
      control={control}
      gameServers={gameServers}
      readOnly={readOnly}
      description={description}
      size={size}
      disabled={disabled}
      inPortal={inPortal}
      hint={hint}
      name={selectName}
      required={required}
      loading={loading}
      label={label}
    />
  );
};

export type GameServerSelectViewProps = CustomSelectProps & { gameServers: GameServerOutputDTO[] };
export const GameServerSelectView: FC<GameServerSelectViewProps> = ({
  control,
  gameServers,
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
  const renderOptionGroup = (groupLabel: string, typeEnum: GameServerOutputDTOTypeEnum) => {
    return (
      <SelectField.OptionGroup label={groupLabel} icon={gameTypeMap[typeEnum].icon}>
        {gameServers.map(({ id, type, name: serverName, reachable }) => {
          if (type !== typeEnum) {
            return null;
          }

          return type === typeEnum ? (
            <SelectField.Option key={`select-${selectName}-${serverName}`} value={id} label={serverName}>
              <Inner>
                <span>{serverName}</span>
                <Tooltip placement="right">
                  <Tooltip.Trigger asChild>
                    <StatusDot isReachable={reachable} />
                  </Tooltip.Trigger>
                  <Tooltip.Content>{reachable ? 'Server online' : 'Server offline'}</Tooltip.Content>
                </Tooltip>
              </Inner>
            </SelectField.Option>
          ) : null;
        })}
      </SelectField.OptionGroup>
    );
  };

  return (
    <SelectField
      control={control}
      name={selectName}
      readOnly={readOnly}
      enableFilter={gameServers.length > 6}
      description={description}
      size={size}
      disabled={disabled}
      inPortal={inPortal}
      hint={hint}
      label={label}
      required={required}
      loading={loading}
      hasMargin={false}
      render={(selectedItems) => {
        if (selectedItems.length === 0) {
          return <p>Select...</p>;
        }
        let selected = gameServers.find((server) => server.id === selectedItems[0].value);

        // Couldn't find the selected server, select the first one
        if (!selected) {
          selected = gameServers[0];
        }

        return (
          <Inner>
            {gameTypeMap[selected.type].icon}
            {selected.name}
          </Inner>
        );
      }}
    >
      {/* IMPORTANT: make sure the types is ordered alphabetically
      otherwise the selected index will be wrong * since it uses the original array to select.
      */}
      {renderOptionGroup('Mock', GameServerOutputDTOTypeEnum.Mock)}
      {renderOptionGroup('Rust', GameServerOutputDTOTypeEnum.Rust)}
      {renderOptionGroup('7 Days to Die', GameServerOutputDTOTypeEnum.Sevendaystodie)}
    </SelectField>
  );
};
