import { FormContextType, RJSFSchema, StrictRJSFSchema, WidgetProps } from '@rjsf/utils';
import { GameServerOutputDTO, GameServerOutputDTOTypeEnum, ItemsOutputDTO } from '@takaro/apiclient';
import {
  styled,
  Avatar,
  SelectQueryField,
  UnControlledSelectQueryField,
  getInitials,
  Skeleton,
} from '@takaro/lib-components';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { useGameServer } from 'queries/gameservers';
import { useItems } from 'queries/items';
import { useState } from 'react';

const gameServerTypeToIconFolderMap = {
  [GameServerOutputDTOTypeEnum.Mock]: 'rust',
  [GameServerOutputDTOTypeEnum.Rust]: 'rust',
  [GameServerOutputDTOTypeEnum.Sevendaystodie]: '7d2d',
};

const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;

  span {
    margin-left: ${({ theme }) => theme.spacing['1']};
  }
`;

// TODO: implement multiselect
export function ItemWidget<T = unknown, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
  name,
  disabled,
  rawErrors = [],
  required,
  id,
  readonly,
  schema,
  value,
  onChange,
}: WidgetProps<T, S, F>) {
  const { selectedGameServerId: gameServerId } = useSelectedGameServer();
  const [itemName, setItemName] = useState<string>('');
  const enabled = itemName !== '';

  const { data: gameServer, isLoading: isLoadingGameServer } = useGameServer(gameServerId);
  const { data, isLoading: isLoadingItems } = useItems(
    { search: { name: [itemName] }, filters: { gameserverId: [gameServerId] } },
    { enabled }
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

  if (isLoadingGameServer) {
    return <Skeleton variant="rectangular" width="100%" height="40px" />;
  }

  if (!gameServer) {
    return <div>unable to show items</div>;
  }

  return (
    <UnControlledSelectQueryField
      id={id}
      name={name}
      disabled={disabled}
      hasError={!!rawErrors.length}
      required={required}
      readOnly={readonly}
      value={value}
      handleInputValueChange={(value) => setItemName(value)}
      isLoadingData={!enabled ? false : isLoadingItems}
      multiSelect={false}
      hasDescription={!!schema.description}
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

        return <div>{selectedItems.map((item) => item.label).join(',')}</div>;
      }}
      onChange={onChange}
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
    </UnControlledSelectQueryField>
  );
}
