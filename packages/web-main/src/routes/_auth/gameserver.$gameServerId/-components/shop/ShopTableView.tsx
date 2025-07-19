import {
  GameServerOutputDTOTypeEnum,
  ShopListingItemMetaOutputDTO,
  ShopListingOutputDTO,
  ShopListingSearchInputDTOExtendEnum,
  ShopListingSearchInputDTOSortDirectionEnum,
} from '@takaro/apiclient';
import {
  Avatar,
  Button,
  Chip,
  DateFormatter,
  Popover,
  Table,
  getInitials,
  styled,
  useTableActions,
} from '@takaro/lib-components';
import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { createColumnHelper, Row } from '@tanstack/react-table';
import { shopListingsQueryOptions } from '../../../../../queries/shopListing';
import { useHasPermission } from '../../../../../hooks/useHasPermission';
import { ShopViewProps } from './ShopView';
import { ShopListingActions } from './ShopListingActions';
import { ShopListingBuyForm } from './ShopListingBuyForm';

const gameServerTypeToIconFolderMap = {
  [GameServerOutputDTOTypeEnum.Mock]: 'rust',
  [GameServerOutputDTOTypeEnum.Rust]: 'rust',
  [GameServerOutputDTOTypeEnum.Sevendaystodie]: '7d2d',
  [GameServerOutputDTOTypeEnum.Generic]: 'generic',
};

const ShopListingBuyFormContainer = styled.div`
  padding: 1rem;
  form {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  button {
    max-height: 35px;
    margin-left: ${({ theme }) => theme.spacing['0_5']};
  }
`;

export const ShopTableView: FC<ShopViewProps> = ({
  gameServerId,
  currencyName,
  gameServerType,
  currency,
  selectedListingIds = [],
  onSelectionChange,
}) => {
  const hasPermission = useHasPermission(['MANAGE_SHOP_LISTINGS']);
  const [quickSearchInput, setQuickSearchInput] = useState<string>('');

  // Convert selectedListingIds array to rowSelection object format
  const rowSelection = selectedListingIds.reduce((acc, id) => ({ ...acc, [id]: true }), {});

  const handleRowSelectionChange = (
    updaterOrValue: Record<string, boolean> | ((old: Record<string, boolean>) => Record<string, boolean>),
  ) => {
    const newSelection = typeof updaterOrValue === 'function' ? updaterOrValue(rowSelection) : updaterOrValue;
    const selectedIds = Object.keys(newSelection).filter((id) => newSelection[id]);
    onSelectionChange?.(selectedIds);
  };

  const { pagination, columnFilters, sorting, columnSearch } = useTableActions<ShopListingOutputDTO>({ pageSize: 25 });
  const { data, isLoading } = useQuery(
    shopListingsQueryOptions({
      page: pagination.paginationState.pageIndex,
      limit: pagination.paginationState.pageSize,
      sortBy: sorting.sortingState[0]?.id,
      sortDirection: sorting.sortingState[0]?.desc
        ? ShopListingSearchInputDTOSortDirectionEnum.Desc
        : ShopListingSearchInputDTOSortDirectionEnum.Asc,
      filters: {
        id: columnFilters.columnFiltersState.find((filter) => filter.id === 'id')?.value,
        name: columnFilters.columnFiltersState.find((filter) => filter.id === 'name')?.value,
        gameServerId: [gameServerId],
      },
      search: {
        name: [
          ...(columnFilters.columnFiltersState.find((filter) => filter.id === 'name')?.value ?? []),
          quickSearchInput,
        ],
      },
      extend: [ShopListingSearchInputDTOExtendEnum.Categories],
    }),
  );

  const columnHelper = createColumnHelper<ShopListingOutputDTO>();
  const columnDefs = [
    ...(hasPermission
      ? [
          columnHelper.display({
            id: 'select',
            header: ({ table }) => {
              // Check if table has the required methods before using them
              if (!table.getIsAllRowsSelected || !table.getToggleAllRowsSelectedHandler) {
                return null;
              }
              return (
                <input
                  type="checkbox"
                  checked={table.getIsAllRowsSelected()}
                  onChange={table.getToggleAllRowsSelectedHandler()}
                />
              );
            },
            cell: ({ row }) => {
              // Check if row has the required methods before using them
              if (!row.getIsSelected || !row.getToggleSelectedHandler) {
                return null;
              }
              return <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />;
            },
            enableSorting: false,
            enableColumnFilter: false,
            size: 50,
          }),
        ]
      : []),
    columnHelper.accessor('id', {
      header: 'ID',
      id: 'id',
      enableColumnFilter: true,
      enableSorting: true,
      meta: { hideColumn: true },
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      id: 'name',
      cell: (info) => info.getValue() ?? 'None',
    }),
    columnHelper.accessor('draft', {
      header: 'Status',
      id: 'draft',
      cell: (info) => (info.getValue() ? <Chip color="primary" label="Draft" /> : 'Available'),
      enableColumnFilter: false,
      meta: {
        dataType: 'boolean',
      },
    }),
    columnHelper.accessor('items', {
      header: 'Amount of items',
      id: 'items',
      cell: (info) => info.getValue().length,
    }),
    columnHelper.accessor('price', {
      header: 'Price per unit',
      id: 'price',
      cell: (info) => (
        <strong>
          {info.getValue()} {currencyName}
        </strong>
      ),
      meta: {
        dataType: 'number',
      },
    }),
    columnHelper.accessor('stock', {
      header: 'Stock',
      id: 'stock',
      cell: (info) => {
        const listing = info.row.original;
        if (!listing.stockEnabled) {
          return <span style={{ color: 'var(--color-text-secondary)' }}>Unlimited</span>;
        }
        const stock = info.getValue() ?? 0;
        if (stock === 0) {
          return <span style={{ color: 'var(--color-error)' }}>Out of stock</span>;
        }
        if (stock <= 5) {
          return <span style={{ color: 'var(--color-warning)' }}>{stock}</span>;
        }
        return <span style={{ color: 'var(--color-success)' }}>{stock}</span>;
      },
      meta: {
        dataType: 'number',
      },
    }),
    columnHelper.accessor('categories', {
      header: 'Categories',
      id: 'categories',
      cell: (info) => {
        const categories = info.getValue();
        if (!categories || categories.length === 0) {
          return <span style={{ color: 'var(--color-text-secondary)' }}>Uncategorized</span>;
        }
        return (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {categories.map((cat) => (
              <Popover key={cat.id}>
                <Popover.Trigger asChild>
                  <span
                    style={{
                      fontSize: '1.2rem',
                      cursor: 'help',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {cat.emoji}
                  </span>
                </Popover.Trigger>
                <Popover.Content>
                  <div style={{ padding: '0.5rem' }}>
                    {cat.emoji} {cat.name}
                  </div>
                </Popover.Content>
              </Popover>
            ))}
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
    }),

    columnHelper.accessor('createdAt', {
      header: 'Created at',
      id: 'createdAt',
      meta: { dataType: 'datetime', hideColumn: true },
      cell: (info) => <DateFormatter ISODate={info.getValue()} />,
      enableSorting: true,
    }),
    columnHelper.accessor('updatedAt', {
      header: 'Updated at',
      id: 'updatedAt',
      meta: { dataType: 'datetime', hideColumn: true },
      cell: (info) => <DateFormatter ISODate={info.getValue()} />,
      enableSorting: true,
    }),

    columnHelper.display({
      header: '',
      id: 'buy',
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: false,
      enablePinning: false,
      enableGlobalFilter: false,
      enableResizing: false,

      cell: (info) => (
        <Popover>
          <Popover.Trigger asChild>
            <Button size="small">Buy listing</Button>
          </Popover.Trigger>
          <Popover.Content>
            <ShopListingBuyFormContainer>
              <ShopListingBuyForm
                isDraft={info.row.original.draft}
                currencyName={currencyName}
                price={info.row.original.price}
                playerCurrencyAmount={currency || 0}
                shopListingId={info.row.original.id}
                stock={info.row.original.stock}
                stockEnabled={info.row.original.stockEnabled}
              />
            </ShopListingBuyFormContainer>
          </Popover.Content>
        </Popover>
      ),
    }),
    columnHelper.display({
      header: 'Actions',
      id: 'actions',
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: true,
      enablePinning: false,
      enableGlobalFilter: false,
      enableResizing: false,
      maxSize: 50,
      meta: { includeColumn: hasPermission },
      cell: (info) => (
        <ShopListingActions
          shopListingId={info.row.original.id}
          shopListingName={info.row.original.name || ''}
          gameServerId={gameServerId}
        />
      ),
    }),
  ];

  const detailsPanel = (row: Row<ShopListingOutputDTO>) => {
    return (
      <>
        <tr className="subrow">
          <th></th>
          <th></th>
          <th>Icon</th>
          <th>Name</th>
          <th>Amount</th>
          <th>Quality</th>
          <th></th>
        </tr>
        {row.original.items.map((item) => (
          <ShopListingMetaItem key={'shoplisting-table-' + item.id} gameServerType={gameServerType} metaItem={item} />
        ))}
      </>
    );
  };

  const p =
    !isLoading && data
      ? {
          paginationState: pagination.paginationState,
          setPaginationState: pagination.setPaginationState,
          pageOptions: pagination.getPageOptions(data),
        }
      : undefined;

  return (
    <Table
      title="Shop"
      id="shop-table"
      columns={columnDefs}
      searchInputPlaceholder="Search shop listing by name"
      onSearchInputChanged={setQuickSearchInput}
      data={(data?.data || []) as ShopListingOutputDTO[]}
      pagination={p}
      columnFiltering={columnFilters}
      columnSearch={columnSearch}
      sorting={sorting}
      canExpand={() => true}
      renderDetailPanel={(row) => detailsPanel(row)}
      isLoading={isLoading}
      rowSelection={{
        rowSelectionState: rowSelection,
        setRowSelectionState: handleRowSelectionChange,
      }}
      getRowId={(row) => row.id}
    />
  );
};

interface ShopListingMetaItemProps {
  gameServerType: GameServerOutputDTOTypeEnum;
  metaItem: ShopListingItemMetaOutputDTO;
}

const ShopListingMetaItem: FC<ShopListingMetaItemProps> = ({ gameServerType, metaItem }) => {
  return (
    <tr className="subrow">
      <td />
      <td></td>
      <td>
        <Avatar size="small">
          <Avatar.Image
            src={`/icons/${gameServerTypeToIconFolderMap[gameServerType]}/${metaItem.item.code}.png`}
            alt={`Item icon of ${metaItem.item.name}`}
          />
          <Avatar.FallBack>{getInitials(metaItem.item.name)}</Avatar.FallBack>
        </Avatar>
      </td>
      <td>{metaItem.item.name}</td>
      <td>{metaItem.amount}</td>
      <td>{metaItem.quality ? metaItem.quality : 'Not assigned'}</td>
      <td></td>
    </tr>
  );
};
