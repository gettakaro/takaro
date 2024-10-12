import { PaginationProps, SelectQueryField, Skeleton, Tooltip } from '@takaro/lib-components';
import { gameServersInfiniteQueryOptions } from 'queries/gameserver';
import { FC, useState } from 'react';
import { GameServerOutputDTO, GameServerOutputDTOTypeEnum } from '@takaro/apiclient';
import { CustomSelectQueryProps } from '..';
import icon7d2d from './7d2d-icon.png';
import iconRust from './rust-icon.png';
import { FaLeaf as TakaroIcon } from 'react-icons/fa';
import { Inner, StatusDot } from './style';
import { useInfiniteQuery } from '@tanstack/react-query';

const gameTypeMap = {
  [GameServerOutputDTOTypeEnum.Mock]: { icon: <TakaroIcon /> },
  [GameServerOutputDTOTypeEnum.Rust]: { icon: <img width="5px" height="5px" src={iconRust} /> },
  [GameServerOutputDTOTypeEnum.Sevendaystodie]: { icon: <img width="20px" height="20px" src={icon7d2d} /> },
};

interface GameServerSelectQueryFieldProps {
  filter?: (server: GameServerOutputDTO) => boolean;
  /// Adds an extra option 'Global - applies to all gameservers', id: 'null'
  /// Because in some situations if no gameserver is selected it is considered for all gameservers.
  addGlobalGameServerOption?: boolean;
}

export const GameServerSelectQueryField: FC<CustomSelectQueryProps & GameServerSelectQueryFieldProps> = ({
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
  filter,
  multiple,
  canClear,
  addGlobalGameServerOption = false,
}) => {
  const [gameServerName, setGameServerName] = useState('');
  const {
    data,
    isLoading: isLoadingData,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isFetching,
  } = useInfiniteQuery(
    gameServersInfiniteQueryOptions({ sortBy: 'type', search: { name: [gameServerName] }, limit: 20 }),
  );

  if (isLoadingData) {
    return <Skeleton variant="text" width="100%" height="35px" />;
  }

  if (!data) {
    return <div>Failed to load gameservers</div>;
  }

  let gameServers = data.pages.flatMap((page) => page.data);

  if (addGlobalGameServerOption) {
    gameServers = [{ name: 'Global - applies to all gameservers', id: 'null' } as GameServerOutputDTO, ...gameServers];
  }

  if (filter) {
    gameServers = gameServers.filter(filter);
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
      canClear={canClear}
      multiple={multiple}
      setGameServerName={setGameServerName}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      groupByGameServerType={addGlobalGameServerOption ? false : true}
      fetchNextPage={fetchNextPage}
    />
  );
};

export type GameServerSelectQueryViewProps = CustomSelectQueryProps &
  PaginationProps & {
    gameServers: GameServerOutputDTO[];
    setGameServerName: (value: string) => void;
    groupByGameServerType?: boolean;
  };
export const GameServerSelectView: FC<GameServerSelectQueryViewProps> = ({
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
  canClear,
  multiple,
  setGameServerName,
  isFetching,
  hasNextPage,
  fetchNextPage,
  groupByGameServerType,
  isFetchingNextPage,
}) => {
  const renderOptionGroup = (groupLabel: string, typeEnum: GameServerOutputDTOTypeEnum) => {
    const gameServersPerType = gameServers.filter((gameServer) => {
      return gameServer.type === typeEnum;
    });

    if (gameServersPerType.length === 0) {
      return undefined;
    }

    return (
      <SelectQueryField.OptionGroup label={groupLabel} icon={gameTypeMap[typeEnum].icon}>
        {gameServersPerType.map(({ id, name: serverName, reachable }) => {
          return (
            <SelectQueryField.Option key={`select-${selectName}-${serverName}`} value={id} label={serverName}>
              <Inner>
                <span>{serverName}</span>
                <Tooltip placement="right">
                  <Tooltip.Trigger asChild>
                    <StatusDot isReachable={reachable} />
                  </Tooltip.Trigger>
                  <Tooltip.Content>{reachable ? 'Server online' : 'Server offline'}</Tooltip.Content>
                </Tooltip>
              </Inner>
            </SelectQueryField.Option>
          );
        })}
      </SelectQueryField.OptionGroup>
    );
  };

  return (
    <SelectQueryField
      control={control}
      name={selectName}
      readOnly={readOnly}
      description={description}
      size={size}
      disabled={disabled}
      inPortal={inPortal}
      hint={hint}
      label={label}
      required={required}
      loading={loading}
      canClear={canClear}
      multiple={multiple}
      handleInputValueChange={setGameServerName}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      render={(selectedItems) => {
        if (selectedItems.length === 0) {
          return <p>Select gameserver...</p>;
        }

        if (multiple) {
          const selectedGameserverValues = selectedItems.map((item) => item.value);
          const selectedGameServers = gameServers.filter((gameServer) =>
            selectedGameserverValues.includes(gameServer.id),
          );
          const selectedGameServerNames = selectedGameServers.map((gameServer) => gameServer.name);
          return <div>{selectedGameServerNames.join(', ')}</div>;
        }

        if (selectedItems.length === 1) {
          const selected = gameServers.find((server) => server.id === selectedItems[0].value);

          if (selected === undefined) return <div>Could not find server</div>;

          console.log(selected);
          if (selected.id === 'null') return <div>{selected.name}</div>;

          return (
            <Inner>
              {gameTypeMap[selected.type].icon}
              {selected.name}
            </Inner>
          );
        }
      }}
    >
      {groupByGameServerType ? (
        <>
          {/* IMPORTANT: make sure the types are ordered alphabetically otherwise the selected index will be wrong * since it uses the original array to select.*/}
          {renderOptionGroup('Mock', GameServerOutputDTOTypeEnum.Mock)}
          {renderOptionGroup('Rust', GameServerOutputDTOTypeEnum.Rust)}
          {renderOptionGroup('7 Days to Die', GameServerOutputDTOTypeEnum.Sevendaystodie)}
        </>
      ) : (
        <>
          {gameServers.map(({ id, name: serverName, reachable }) => {
            return (
              <SelectQueryField.Option key={`select-${selectName}-${serverName}`} value={id} label={serverName}>
                <Inner>
                  <span>{serverName}</span>
                  {reachable !== undefined && (
                    <Tooltip placement="right">
                      <Tooltip.Trigger asChild>
                        <StatusDot isReachable={reachable} />
                      </Tooltip.Trigger>
                      <Tooltip.Content>{reachable ? 'Server online' : 'Server offline'}</Tooltip.Content>
                    </Tooltip>
                  )}
                </Inner>
              </SelectQueryField.Option>
            );
          })}
        </>
      )}
    </SelectQueryField>
  );
};
