import { GameServerOutputDTO, GameServerOutputDTOTypeEnum, ItemsOutputDTO } from '@takaro/apiclient';
import { Avatar, getInitials, SelectQueryField, Skeleton, styled } from '@takaro/lib-components';
import { gameServerQueryOptions } from 'queries/gameserver';
import { itemQueryOptions, itemsQueryOptions } from 'queries/item';
import { FC, useState, useCallback } from 'react';
import { CustomQuerySelectProps } from '..';
import { useQuery } from '@tanstack/react-query';
import { useController } from 'react-hook-form';

export interface ItemSelectProps extends CustomQuerySelectProps {
  gameServerId: string;
}

const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;

  & > span {
    margin-left: ${({ theme }) => theme.spacing['1']};
  }
`;

const gameServerTypeToIconFolderMap = {
  [GameServerOutputDTOTypeEnum.Mock]: 'rust',
  [GameServerOutputDTOTypeEnum.Rust]: 'rust',
  [GameServerOutputDTOTypeEnum.Sevendaystodie]: '7d2d',
};

export const ItemSelect: FC<ItemSelectProps> = ({
  control,
  name,
  hint,
  size,
  label,
  loading,
  disabled,
  inPortal,
  readOnly,
  required,
  hasMargin,
  description,
  placeholder = 'Select an item',
  gameServerId,
  multiple,
}) => {
  const [itemName, setItemName] = useState<string>('');
  const { field } = useController({ name, control });

  const { data: gameServer, isLoading: isLoadingGameServer } = useQuery(gameServerQueryOptions(gameServerId));

  const { data, isLoading: isLoadingItems } = useQuery(
    itemsQueryOptions({ search: { name: [itemName] }, filters: { gameserverId: [gameServerId] } })
  );

  const { data: initialItem } = useQuery({
    ...itemQueryOptions(field.value),
    enabled: !!field.value,
  });

  const items = data?.data ?? [];
  const includingInitialItem =
    initialItem && !items.some((item) => item.id === initialItem.id) ? [initialItem, ...items] : items;

  if (isLoadingGameServer) {
    return <Skeleton variant="rectangular" width="100%" height="40px" />;
  }

  if (!gameServer) {
    return <div>unable to show items</div>;
  }

  return (
    <ItemSelectQueryView
      control={control}
      items={includingInitialItem}
      name={name}
      readOnly={readOnly}
      description={description}
      size={size}
      disabled={disabled}
      inPortal={inPortal}
      hint={hint}
      multiple={multiple}
      hasMargin={hasMargin}
      placeholder={placeholder}
      required={required}
      loading={loading}
      label={label}
      gameServer={gameServer}
      setItemName={setItemName}
      isLoadingData={isLoadingItems}
    />
  );
};

export type ItemSelectQueryViewProps = CustomQuerySelectProps & {
  items: ItemsOutputDTO[];
  gameServer: GameServerOutputDTO;
  isLoadingData?: boolean;
  setItemName: (value: string) => void;
};
export const ItemSelectQueryView: FC<ItemSelectQueryViewProps> = ({
  control,
  items,
  name: selectName,
  readOnly,
  description,
  size,
  disabled,
  placeholder,
  hasMargin,
  multiple,
  inPortal,
  hint,
  required,
  gameServer,
  loading,
  isLoadingData = false,
  setItemName,
  label,
}) => {
  const renderIcon = useCallback((gameServer: GameServerOutputDTO, item: ItemsOutputDTO) => {
    if (item.code && gameServer && gameServerTypeToIconFolderMap[gameServer.type] !== 'Mock') {
      return (
        <Avatar size="small">
          <Avatar.Image
            src={`/icons/${gameServerTypeToIconFolderMap[gameServer.type]}/${item.code}.png`}
            alt={`Item icon of ${item.name}`}
          />
          <Avatar.FallBack>{getInitials(item.name)}</Avatar.FallBack>
        </Avatar>
      );
    }
  }, []);

  return (
    <SelectQueryField
      name={selectName}
      debounce={500}
      hint={hint}
      label={label}
      size={size}
      loading={loading}
      isLoadingData={isLoadingData}
      disabled={disabled}
      inPortal={inPortal}
      readOnly={readOnly}
      required={required}
      multiple={multiple}
      hasMargin={hasMargin}
      description={description}
      render={(selectedItems) => {
        if (selectedItems.length === 0) {
          return <div>Select item...</div>;
        }

        // multiselect with 1 item and single select
        if (selectedItems.length === 1) {
          // find item in list of items
          const item = items.find((item) => item.id === selectedItems[0].value);
          if (!item) {
            return <div>{selectedItems[0].label}</div>;
          }
          return (
            <Inner>
              {renderIcon(gameServer, item)} {selectedItems[0].label}
            </Inner>
          );
        }

        return <div>{selectedItems.map((item) => item.label).join(', ')}</div>;
      }}
      placeholder={placeholder}
      handleInputValueChange={(value) => setItemName(value)}
      control={control}
    >
      <SelectQueryField.OptionGroup label="options">
        {items.map((item) => (
          <SelectQueryField.Option value={item.id} label={item.name}>
            <Inner>
              {renderIcon(gameServer, item)}
              <span>{item.name}</span>
            </Inner>
          </SelectQueryField.Option>
        ))}
      </SelectQueryField.OptionGroup>
    </SelectQueryField>
  );
};
