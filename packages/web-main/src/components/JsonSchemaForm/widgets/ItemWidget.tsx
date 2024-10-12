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
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import { gameServerQueryOptions } from 'queries/gameserver';
import { ItemsInfiniteQueryOptions, itemsQueryOptions } from 'queries/item';
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

const shouldFilter = (value: unknown, multiple: boolean): boolean => {
  if (multiple) {
    return value !== undefined && (value as string[]).length !== 0;
  }
  return value !== undefined;
};

export function ItemWidget<T = unknown, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
  name,
  disabled,
  rawErrors = [],
  required,
  id,
  readonly,
  schema,
  multiple,
  value,
  onChange,
}: WidgetProps<T, S, F>) {
  const { gameServerId } = getRouteApi('/_auth/gameserver/$gameServerId/modules/$moduleId/install/').useParams();
  const [itemName, setItemName] = useState<string>('');
  const enabled = itemName !== '';
  const shouldPreviousItemsBeLoaded = shouldFilter(value, multiple as boolean);

  const { data: gameServer, isLoading: isLoadingGameServer } = useQuery(gameServerQueryOptions(gameServerId));
  const {
    data: prev,
    isLoading: isLoadingPreviousItems,
    isFetchingNextPage,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    ItemsInfiniteQueryOptions({
      filters: { gameserverId: [gameServerId], ...(shouldPreviousItemsBeLoaded && { id: multiple ? value : [value] }) },
    }),
  );

  const previousItems = prev?.pages.flatMap((page) => page.data) ?? [];

  const { data, isLoading: isLoadingItems } = useQuery(
    itemsQueryOptions({
      ...(itemName !== '' && { search: { name: [itemName] } }),
      filters: { gameserverId: [gameServerId] },
    }),
  );
  const searchedItems = data?.data ?? [];

  // get rid of duplicates
  const items = [...searchedItems, ...previousItems].filter(
    (item, index, self) => self.findIndex((i) => i.id === item.id) === index,
  );

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

  if (isLoadingGameServer || (isLoadingPreviousItems && shouldPreviousItemsBeLoaded)) {
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
      onChange={onChange}
      inPortal={true}
      handleInputValueChange={(value) => setItemName(value)}
      isLoadingData={!enabled ? false : isLoadingItems}
      multiple={multiple}
      hasDescription={!!schema.description}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      optionCount={data?.meta.total}
      fetchNextPage={fetchNextPage}
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
    >
      <SelectQueryField.OptionGroup label="options">
        {items.map((item) => (
          <SelectQueryField.Option value={item.id} label={item.name} key={name + '-' + item.id}>
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
