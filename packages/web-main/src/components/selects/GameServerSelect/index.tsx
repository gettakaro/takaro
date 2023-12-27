import { Select, styled, Tooltip } from '@takaro/lib-components';
import { useGameServers } from 'queries/gameservers';
import { FC } from 'react';
import { GameServerOutputDTOTypeEnum } from '@takaro/apiclient';
import { CustomSelectProps } from '..';
import icon7d2d from './7d2d-icon.png';
import iconRust from './rust-icon.png';
import { FaLeaf as TakaroIcon } from 'react-icons/fa';
import { TooltipTrigger } from '@takaro/lib-components/src/components/feedback/Tooltip/TooltipTrigger';

export const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;

  img,
  svg {
    width: ${({ theme }) => theme.spacing[2]}!important;
    height: ${({ theme }) => theme.spacing[2]}!important;
    margin: 0 !important;
    margin-bottom: 0 !important;
    margin-right: ${({ theme }) => theme.spacing['1']}!important;
    fill: ${({ theme }) => theme.colors.primary};
  }
`;

export const StatusDot = styled.div<{ isReachable: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 3px;
  margin-left: ${({ theme }) => theme.spacing['0_75']};
  background-color: ${({ isReachable, theme }) => (isReachable ? theme.colors.success : theme.colors.error)};
`;

const gameTypeMap = {
  [GameServerOutputDTOTypeEnum.Mock]: { icon: <TakaroIcon /> },
  [GameServerOutputDTOTypeEnum.Rust]: { icon: <img width="5px" height="5px" src={iconRust} /> },
  [GameServerOutputDTOTypeEnum.Sevendaystodie]: { icon: <img width="20px" height="20px" src={icon7d2d} /> },
};

export const GameServerSelect: FC<CustomSelectProps> = ({
  readOnly = false,
  label = 'Game Server',
  hint,
  name: selectName,
  size,
  loading,
  control,
  disabled,
  inPortal,
  description,
  required,
}) => {
  const { data, isLoading: isLoadingData } = useGameServers({ sortBy: 'type' });

  if (isLoadingData) {
    // TODO: better loading state
    return <div>loading...</div>;
  }

  // flatten pages into a single array
  const gameServers = data?.pages.flatMap((page) => page.data);

  if (!gameServers) {
    return <div>no game servers</div>;
  }

  const renderOptionGroup = (groupLabel: string, typeEnum: GameServerOutputDTOTypeEnum) => {
    return (
      <Select.OptionGroup label={groupLabel} icon={gameTypeMap[typeEnum].icon}>
        {gameServers.map(({ id, type, name: serverName, reachable }) => {
          if (type !== typeEnum) {
            return null;
          }

          return type === typeEnum ? (
            <Select.Option key={`select-${selectName}-${serverName}`} value={id} label={serverName}>
              <Inner>
                <span>{serverName}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <StatusDot isReachable={reachable} />
                  </TooltipTrigger>
                  <Tooltip.Content>{reachable ? 'Server online' : 'Server offline'}</Tooltip.Content>
                </Tooltip>
              </Inner>
            </Select.Option>
          ) : null;
        })}
      </Select.OptionGroup>
    );
  };

  return (
    <Select
      control={control}
      name={selectName}
      readOnly={readOnly}
      label={label}
      enableFilter={gameServers.length > 6}
      description={description}
      size={size}
      disabled={disabled}
      inPortal={inPortal}
      hint={hint}
      required={required}
      loading={loading}
      render={(selectedIndex) => {
        if (selectedIndex === undefined || selectedIndex === -1) {
          return <div>Select...</div>;
        }
        return (
          <Inner>
            {gameTypeMap[gameServers[selectedIndex]?.type].icon}
            {gameServers[selectedIndex]?.name}
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
    </Select>
  );
};
