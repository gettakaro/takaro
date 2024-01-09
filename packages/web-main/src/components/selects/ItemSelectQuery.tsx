import { GameServerOutputDTO, GameServerOutputDTOTypeEnum, ItemsOutputDTO } from '@takaro/apiclient';
import { Avatar, getInitials, SelectQueryField, styled } from '@takaro/lib-components';
import { useGameServer } from 'queries/gameservers';
import { useItems } from 'queries/items';
import { FC, useState } from 'react';
import { CustomQuerySelectProps } from '.';

interface ItemsSelectProps extends CustomQuerySelectProps {
  gameServerId: string;
}

const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;

  span {
    margin-left: ${({ theme }) => theme.spacing['1']};
  }
`;

const gameServerTypeToIconFolderMap = {
  [GameServerOutputDTOTypeEnum.Mock]: 'rust',
  [GameServerOutputDTOTypeEnum.Rust]: 'rust',
  [GameServerOutputDTOTypeEnum.Sevendaystodie]: '7d2d',
};

export const ItemSelect: FC<ItemsSelectProps> = ({
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
  placeholder,
  gameServerId,
}) => {
  const [itemName, setItemName] = useState<string>('');

  const { data: gameServer, isLoading: isLoadingGameServer } = useGameServer(gameServerId);
  const { data, isLoading: isLoadingItems } = useItems(
    { search: { name: [itemName] }, filters: { gameserverId: [gameServerId] } },
    { enabled: itemName !== '' }
  );
  const items = data?.pages.flatMap((page) => page.data) ?? [];

  const renderIcon = (gameServer: GameServerOutputDTO, item: ItemsOutputDTO) => {
    if (item.code && gameServer && gameServerTypeToIconFolderMap[gameServer.type] !== 'Mock') {
      return (
        <Avatar size="tiny">
          <Avatar.Image
            src={`/icons/${gameServerTypeToIconFolderMap[gameServer.type]}/${item.code}.png`}
            alt={`Item icon of ${item.name}`}
          />
          <Avatar.FallBack>{getInitials(item.name)}</Avatar.FallBack>
        </Avatar>
      );
    }
  };

  if (!gameServer) {
    return <div>unable to show items</div>;
  }

  return (
    <SelectQueryField
      name={name}
      hint={hint}
      label={label}
      size={size}
      loading={loading}
      disabled={disabled}
      inPortal={inPortal}
      readOnly={readOnly}
      required={required}
      hasMargin={hasMargin}
      description={description}
      placeholder={placeholder}
      handleInputValueChange={(value) => setItemName(value)}
      isLoadingData={isLoadingGameServer || isLoadingItems}
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
