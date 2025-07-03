import { FormContextType, RJSFSchema, StrictRJSFSchema, WidgetProps } from '@rjsf/utils';
import { GameServerOutputDTO, GameServerOutputDTOTypeEnum, ItemsOutputDTO } from '@takaro/apiclient';
import {
  styled,
  Avatar,
  SelectQueryField,
  UnControlledSelectQueryField,
  getInitials,
  Skeleton,
  ToggleButtonGroup,
} from '@takaro/lib-components';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { gameServerQueryOptions } from '../../../queries/gameserver';
import { ItemsInfiniteQueryOptions } from '../../../queries/item';
import { useState } from 'react';

const gameServerTypeToIconFolderMap = {
  [GameServerOutputDTOTypeEnum.Mock]: 'rust',
  [GameServerOutputDTOTypeEnum.Rust]: 'rust',
  [GameServerOutputDTOTypeEnum.Sevendaystodie]: '7d2d',
  [GameServerOutputDTOTypeEnum.Generic]: 'generic',
};

const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;

  & > span {
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
  const { gameServerId } = useParams({ strict: false }) as { gameServerId: string };
  const [filterInput, setFilterInput] = useState<string>('');
  const enabled = filterInput !== '';
  const shouldPreviousItemsBeLoaded = shouldFilter(value, multiple as boolean);
  const [searchFields, setSearchFields] = useState<Map<string, boolean>>(new Map());

  const { data: gameServer, isLoading: isLoadingGameServer } = useQuery(gameServerQueryOptions(gameServerId));

  const { data: prev, isLoading: isLoadingPreviousItems } = useInfiniteQuery({
    ...ItemsInfiniteQueryOptions({
      filters: { gameserverId: [gameServerId], id: multiple ? value : [value] },
    }),
    enabled: shouldPreviousItemsBeLoaded,
  });

  const previousItems = prev?.pages.flatMap((page) => page.data) ?? [];

  const {
    data,
    isLoading: isLoadingItems,
    isFetchingNextPage,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    ItemsInfiniteQueryOptions({
      ...(filterInput !== '' &&
        (searchFields.get('name') || searchFields.get('code')) && {
          search: {
            ...(searchFields.get('name') && { name: [filterInput] }),
            ...(searchFields.get('code') && { code: [filterInput] }),
          },
        }),
      filters: { gameserverId: [gameServerId] },
    }),
  );
  const searchedItems = data?.pages.flatMap((page) => page.data) ?? [];

  // get rid of duplicates
  const items = [...previousItems, ...searchedItems].filter(
    (item, index, self) => self.findIndex((i) => i.id === item.id) === index,
  );

  const renderIcon = (gameServer: GameServerOutputDTO, item: ItemsOutputDTO) => {
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
  };

  if (isLoadingGameServer || (isLoadingPreviousItems && shouldPreviousItemsBeLoaded)) {
    return <Skeleton variant="rectangular" width="100%" height="40px" />;
  }

  if (!gameServer) {
    return <div>unable to show items</div>;
  }

  function renderToggleButtonGroup() {
    return (
      <ToggleButtonGroup
        exclusive={false}
        orientation="horizontal"
        canSelectNone={false}
        defaultValue="name"
        onChange={(changedSearchFieldMap) => setSearchFields(() => changedSearchFieldMap as Map<string, boolean>)}
      >
        <ToggleButtonGroup.Button value="code" tooltip="Search by item code">
          code
        </ToggleButtonGroup.Button>
        <ToggleButtonGroup.Button value="name" tooltip="Search by item name">
          name
        </ToggleButtonGroup.Button>
      </ToggleButtonGroup>
    );
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
      placeholder="Search for item"
      handleInputValueChange={(value) => setFilterInput(value)}
      isLoadingData={!enabled ? false : isLoadingItems}
      multiple={multiple}
      hasDescription={!!schema.description}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      optionCount={data?.pages[0].meta.total}
      fetchNextPage={fetchNextPage}
      render={(selectedItems) => {
        return (
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              paddingRight: '10px',
              overflowWrap: 'break-word',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ flex: '1 1 auto', overflow: 'hidden', marginRight: '10px', textOverflow: 'ellipsis' }}>
              {selectedItems.length === 0 && <div>Select item...</div>}
              {selectedItems.length === 1 &&
                // Find item in list of items
                (() => {
                  const item = items.find((item) => item.id === selectedItems[0].value);
                  if (!item) {
                    return <div>{selectedItems[0].label}</div>;
                  }
                  return (
                    <Inner>
                      {renderIcon(gameServer, item)} {selectedItems[0].label}
                    </Inner>
                  );
                })()}
              {selectedItems.length > 1 && <>{selectedItems.map((item) => item.label).join(',')}</>}
            </div>
            {renderToggleButtonGroup()}
          </div>
        );
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
