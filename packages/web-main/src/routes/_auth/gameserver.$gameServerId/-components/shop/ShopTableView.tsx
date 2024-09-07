import {
  GameServerOutputDTOTypeEnum,
  ShopListingOutputDTO,
  ShopListingSearchInputDTOSortDirectionEnum,
} from '@takaro/apiclient';
import {
  Avatar,
  Button,
  Chip,
  DateFormatter,
  Table,
  getInitials,
  styled,
  useTableActions,
} from '@takaro/lib-components';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { shopListingsQueryOptions } from 'queries/shopListing';
import { useNavigate } from '@tanstack/react-router';
import { useHasPermission } from 'hooks/useHasPermission';
import { ShopViewProps } from './ShopView';
import { ShopListingActions } from './ShopListingActions';
import { ShopListingBuyForm } from './ShopListingBuyForm';

const gameServerTypeToIconFolderMap = {
  [GameServerOutputDTOTypeEnum.Mock]: 'rust',
  [GameServerOutputDTOTypeEnum.Rust]: 'rust',
  [GameServerOutputDTOTypeEnum.Sevendaystodie]: '7d2d',
};

const ShopListingBuyFormContainer = styled.div`
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

export const ShopTableView: FC<ShopViewProps> = ({ gameServerId, currencyName, gameServerType, currency }) => {
  const navigate = useNavigate();
  const hasPermission = useHasPermission(['MANAGE_SHOP_LISTINGS']);

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
      search: {},
    }),
  );

  const handleOnCreateShopListingClicked = () => {
    navigate({ to: '/gameserver/$gameServerId/shop/listing/create', params: { gameServerId } });
  };

  const columnHelper = createColumnHelper<ShopListingOutputDTO>();
  const columnDefs = [
    columnHelper.accessor('id', {
      header: 'ID',
      id: 'id',
      enableColumnFilter: true,
      enableSorting: true,
      meta: { hiddenColumn: true },
    }),
    columnHelper.display({
      header: 'Icon',
      id: 'icon',
      cell: (info) => {
        const shopListingName = info.row.original.name || info.row.original.items[0].item.name;

        return (
          <Avatar size="medium">
            <Avatar.Image
              src={`/icons/${gameServerTypeToIconFolderMap[gameServerType]}/${info.row.original.items[0].item.code}.png`}
              alt={`Item icon of ${info.row.original.items[0].item.name}`}
            />
            <Avatar.FallBack>{getInitials(shopListingName)}</Avatar.FallBack>
          </Avatar>
        );
      },
      maxSize: 30,
      enableColumnFilter: false,
      enableGlobalFilter: false,
      enableMultiSort: false,
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      id: 'name',
      cell: (info) => info.getValue() ?? 'None',
    }),
    columnHelper.accessor('items', {
      header: 'Items',
      id: 'items',
      cell: (info) =>
        info
          .getValue()
          .map((shoplistingMeta) => `${shoplistingMeta.amount}x ${shoplistingMeta.item.name}`)
          .join(', '),
    }),
    columnHelper.accessor('draft', {
      header: 'Status',
      id: 'draft',
      cell: (info) => (info.getValue() ? <Chip color="primary" label="Draft" /> : 'Available'),
    }),

    columnHelper.accessor('createdAt', {
      header: 'Created at',
      id: 'createdAt',
      meta: { dataType: 'datetime', hiddenColumn: true },
      cell: (info) => <DateFormatter ISODate={info.getValue()} />,
      enableSorting: true,
    }),
    columnHelper.accessor('updatedAt', {
      header: 'Updated at',
      id: 'updatedAt',
      meta: { dataType: 'datetime', hiddenColumn: true },
      cell: (info) => <DateFormatter ISODate={info.getValue()} />,
      enableSorting: true,
    }),
    columnHelper.display({
      header: '',
      id: 'buy',
      maxSize: 30,
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: false,
      enablePinning: false,
      enableGlobalFilter: false,
      enableResizing: false,
      cell: (info) => (
        <ShopListingBuyFormContainer>
          <ShopListingBuyForm
            isDraft={info.row.original.draft}
            currencyName={currencyName}
            price={info.row.original.price}
            playerCurrencyAmount={currency || 0}
            shopListingId={info.row.original.id}
          />
        </ShopListingBuyFormContainer>
      ),
    }),
    columnHelper.display({
      header: 'Other actions',
      id: 'actions',
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: true,
      enablePinning: false,
      enableGlobalFilter: false,
      enableResizing: false,
      maxSize: 50,
      cell: (info) => (
        <ShopListingActions
          shopListingId={info.row.original.id}
          shopListingName={info.row.original.name || ''}
          gameServerId={gameServerId}
        />
      ),
    }),
  ];

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
      {...(hasPermission && {
        renderToolbar: () => <Button onClick={handleOnCreateShopListingClicked} text="Create shop listing" />,
      })}
      columns={columnDefs}
      data={data?.data as ShopListingOutputDTO[]}
      pagination={p}
      columnFiltering={columnFilters}
      columnSearch={columnSearch}
      sorting={sorting}
      isLoading={isLoading}
    />
  );
};
