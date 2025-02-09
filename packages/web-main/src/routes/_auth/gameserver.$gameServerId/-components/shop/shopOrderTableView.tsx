import {
  ShopOrderOutputDTO,
  ShopOrderOutputDTOStatusEnum,
  ShopOrderSearchInputDTOSortDirectionEnum,
} from '@takaro/apiclient';
import {
  Button,
  Chip,
  DateFormatter,
  Dialog,
  Dropdown,
  IconButton,
  Table,
  useTheme,
  useTableActions,
} from '@takaro/lib-components';
import { Link, useParams } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { shopOrdersQueryOptions, useShopOrderCancel, useShopOrderClaim } from '../../../../../queries/shopOrder';
import { FC, useState } from 'react';
import {
  AiOutlineRight as ActionIcon,
  AiOutlineClose as CancelOrderIcon,
  AiOutlineCheck as ClaimOrderIcon,
} from 'react-icons/ai';
import { useDocumentTitle } from '../../../../../hooks/useDocumentTitle';
import { userMeQueryOptions } from '../../../../../queries/user';
import { PlayerContainer } from '../../../../../components/Player';
import { playerOnGameServerQueryOptions } from '../../../../../queries/pog';

interface ShopOrderTableView {
  gameServerId: string;
}

export const ShopOrderTableView: FC<ShopOrderTableView> = ({ gameServerId }) => {
  useDocumentTitle('Orders');

  const { pagination, columnFilters, sorting, columnSearch } = useTableActions<ShopOrderOutputDTO>({ pageSize: 25 });
  const { data, isLoading } = useQuery({
    ...shopOrdersQueryOptions({
      page: pagination.paginationState.pageIndex,
      limit: pagination.paginationState.pageSize,
      sortBy: sorting.sortingState[0] ? sorting.sortingState[0].id : 'createdAt',
      sortDirection: sorting.sortingState[0]
        ? sorting.sortingState[0]?.desc
          ? ShopOrderSearchInputDTOSortDirectionEnum.Desc
          : ShopOrderSearchInputDTOSortDirectionEnum.Asc
        : ShopOrderSearchInputDTOSortDirectionEnum.Desc,
      filters: {
        listingId: columnFilters.columnFiltersState.find((filter) => filter.id === 'listingId')?.value,
        status: columnFilters.columnFiltersState.find((filter) => filter.id === 'status')?.value,
        gameServerId: [gameServerId],
      },
      search: {
        // playerId: columnSearch.columnSearchState.find((search) => search.id === 'playerId')?.value,
        listingId: columnSearch.columnSearchState.find((search) => search.id === 'listingId')?.value,
        status: columnSearch.columnSearchState.find((search) => search.id === 'status')?.value,
      },
      extend: ['listing', 'listing.items.item'],
    }),
  });

  const columnHelper = createColumnHelper<ShopOrderOutputDTO>();
  const columnDefs = [
    columnHelper.accessor('listingId', {
      header: 'Listing',
      id: 'listingId',
      cell: (info) => (
        <Link
          disabled={!!info.row.original.listing?.deletedAt}
          to="/gameserver/$gameServerId/shop/listing/$shopListingId/view"
          params={{ gameServerId, shopListingId: info.getValue() }}
        >
          {info.row.original.listing?.deletedAt ? '[Deleted] ' : ''}
          {info.row.original.listing?.name ?? info.row.original.listing?.items[0].item.name}
        </Link>
      ),
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('amount', {
      header: 'Amount',
      id: 'amount',
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      id: 'status',
      cell: (info) => {
        switch (info.getValue()) {
          case 'PAID':
            return <Chip variant="outline" color="warning" label={info.getValue()} />;
          case 'CANCELED':
            return <Chip variant="outline" color="error" label={info.getValue()} />;
          case 'COMPLETED':
            return <Chip variant="outline" color="success" label={info.getValue()} />;
        }
      },
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created At',
      id: 'createdAt',
      cell: (info) => <DateFormatter ISODate={info.getValue()} />,
      enableSorting: true,
      meta: {
        dataType: 'datetime',
      },
    }),
    columnHelper.accessor('updatedAt', {
      header: 'Updated At',
      id: 'updatedAt',
      cell: (info) => <DateFormatter ISODate={info.getValue()} />,
      enableSorting: true,
      meta: {
        dataType: 'datetime',
      },
    }),
    columnHelper.accessor('playerId', {
      header: 'Player',
      id: 'playerId',
      enableSorting: true,
      cell: (info) => <PlayerContainer playerId={info.getValue()} />,
      meta: { dataType: 'string' },
    }),
    columnHelper.display({
      header: 'Actions',
      id: 'actions',
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: false,
      enablePinning: false,
      enableGlobalFilter: false,
      enableResizing: false,
      maxSize: 50,
      cell: (info) => <ShopOrderActionsDataQueryWrapper shopOrder={info.row.original} />,
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
      title="List of Orders"
      id="orders"
      columns={columnDefs}
      data={data?.data as ShopOrderOutputDTO[]}
      pagination={p}
      columnFiltering={columnFilters}
      columnSearch={columnSearch}
      sorting={sorting}
      isLoading={isLoading}
    />
  );
};

// This is only needed until user is replaced with player in shoporder.
const ShopOrderActionsDataQueryWrapper: FC<{ shopOrder: ShopOrderOutputDTO }> = ({ shopOrder }) => {
  const { gameServerId } = useParams({ from: '/_auth/gameserver/$gameServerId/shop/orders' });
  const { data: me, isPending: isPendingMe } = useQuery(userMeQueryOptions());

  if (isPendingMe) {
    return <span>Loading actions...</span>;
  }
  if (!me) {
    return '';
  }

  return (
    <ShopOrderActions
      currentPlayerId={me?.player?.id}
      shopOrder={shopOrder}
      gameServerId={gameServerId}
      playerId={shopOrder.playerId}
    />
  );
};

interface ShopOrderActionsProps {
  shopOrder: ShopOrderOutputDTO;
  playerId: string;
  gameServerId: string;
  currentPlayerId?: string;
}

const ShopOrderActions: FC<ShopOrderActionsProps> = ({ shopOrder, gameServerId, playerId, currentPlayerId }) => {
  const [openCancelOrderDialog, setOpenCancelOrderDialog] = useState(false);
  const { mutate: cancelShopOrder, isPending: isPendingShopOrderCancel } = useShopOrderCancel();
  const { data: pog } = useQuery(playerOnGameServerQueryOptions(gameServerId, playerId));
  const { mutateAsync: claimShopOrder } = useShopOrderClaim();
  const theme = useTheme();

  const orderOfCurrentUser = shopOrder.playerId === currentPlayerId;
  const handleCancelOrderClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setOpenCancelOrderDialog(true);
  };

  const handleClaimShopOrderClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    claimShopOrder({
      shopOrderId: shopOrder.id,
    });
  };

  return (
    <>
      <Dropdown placement="left">
        <Dropdown.Trigger asChild>
          <IconButton icon={<ActionIcon />} ariaLabel="shop-order-actions" />
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Menu.Group>
            {shopOrder.status == ShopOrderOutputDTOStatusEnum.Paid && (
              <Dropdown.Menu.Item
                label={
                  orderOfCurrentUser
                    ? pog?.online
                      ? 'Claim order'
                      : 'Claim order (you are offline)'
                    : 'Claim order (not your order)'
                }
                icon={<ClaimOrderIcon />}
                onClick={handleClaimShopOrderClick}
                disabled={pog?.online === undefined || pog?.online === false}
              />
            )}
            <Dropdown.Menu.Item
              disabled={shopOrder.status !== ShopOrderOutputDTOStatusEnum.Paid}
              label="Cancel order"
              icon={<CancelOrderIcon fill={theme.colors.error} />}
              onClick={handleCancelOrderClick}
            />
          </Dropdown.Menu.Group>
        </Dropdown.Menu>
      </Dropdown>
      <Dialog open={openCancelOrderDialog} onOpenChange={setOpenCancelOrderDialog}>
        <Dialog.Content>
          <Dialog.Heading>Shop Order</Dialog.Heading>
          <Dialog.Body size="medium">
            <p>Are you sure you want to Cancel your order?</p>
            <Button
              isLoading={isPendingShopOrderCancel}
              onClick={() => cancelShopOrder({ shopOrderId: shopOrder.id })}
              fullWidth
              text="Cancel order"
              color="error"
            />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
