import {
  GameServerOutputDTOTypeEnum,
  ShopListingOutputDTO,
  ShopListingSearchInputDTOSortDirectionEnum,
} from '@takaro/apiclient';
import { Avatar, Button, DateFormatter, Table, getInitials, useTableActions } from '@takaro/lib-components';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { shopListingsQueryOptions } from 'queries/shopListing';
import { useNavigate } from '@tanstack/react-router';
import { useHasPermission } from 'hooks/useHasPermission';
import { ShopViewProps } from './ShopView';

const gameServerTypeToIconFolderMap = {
  [GameServerOutputDTOTypeEnum.Mock]: 'rust',
  [GameServerOutputDTOTypeEnum.Rust]: 'rust',
  [GameServerOutputDTOTypeEnum.Sevendaystodie]: '7d2d',
};

export const ShopTableView: FC<ShopViewProps> = ({ gameServerId, currencyName, gameServerType }) => {
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
    })
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
          <Avatar size="small">
            <Avatar.Image
              src={`/icons/${gameServerTypeToIconFolderMap[gameServerType]}/${info.row.original.items[0].item.code}.png`}
              alt={`Item icon of ${info.row.original.items[0].item.name}`}
            />
            <Avatar.FallBack>{getInitials(shopListingName)}</Avatar.FallBack>
          </Avatar>
        );
      },
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
    columnHelper.accessor('price', {
      header: 'Price',
      id: 'price',
      meta: { dataType: 'number' },
      enableSorting: true,
      cell: (info) => (
        <>
          {info.getValue()} {currencyName}
        </>
      ),
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
