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
  Skeleton,
  Table,
  useTableActions,
} from '@takaro/lib-components';
import { Link } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { shopOrdersQueryOptions, useShopOrderCancel, useShopOrderClaim } from 'queries/shopOrder';
import { FC, useState } from 'react';
import {
  AiOutlineRight as ActionIcon,
  AiOutlineClose as CancelOrderIcon,
  AiOutlineCheck as ClaimOrderIcon,
} from 'react-icons/ai';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { userQueryOptions } from 'queries/user';
import { PlayerContainer } from 'components/Player';

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
      sortBy: sorting.sortingState[0]?.id,
      sortDirection: sorting.sortingState[0]?.desc
        ? ShopOrderSearchInputDTOSortDirectionEnum.Desc
        : ShopOrderSearchInputDTOSortDirectionEnum.Asc,
      filters: {
        listingId: columnFilters.columnFiltersState.find((filter) => filter.id === 'listingId')?.value,
        status: columnFilters.columnFiltersState.find((filter) => filter.id === 'status')?.value,
      },
      search: {
        userId: columnSearch.columnSearchState.find((search) => search.id === 'userId')?.value,
        listingId: columnSearch.columnSearchState.find((search) => search.id === 'listingId')?.value,
        status: columnSearch.columnSearchState.find((search) => search.id === 'status')?.value,
      },
      extend: ['listing'],
    }),
  });

  const columnHelper = createColumnHelper<ShopOrderOutputDTO>();
  const columnDefs = [
    columnHelper.accessor('listingId', {
      header: 'Listing ID',
      id: 'listingId',
      cell: (info) => (
        <Link
          to="/gameserver/$gameServerId/shop/listing/$shopListingId/view"
          params={{ gameServerId, shopListingId: info.getValue() }}
        >
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
    columnHelper.accessor('userId', {
      header: 'Player',
      id: 'userId',
      enableSorting: true,
      cell: (info) => <UserToPlayer userId={info.getValue()} />,
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
      cell: (info) => <ShopOrderActions shopOrder={info.row.original} />,
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

interface ShopOrderActionsProps {
  shopOrder: ShopOrderOutputDTO;
}

const ShopOrderActions: FC<ShopOrderActionsProps> = ({ shopOrder }) => {
  const [openCancelOrderDialog, setOpenCancelOrderDialog] = useState(false);
  const { mutate: cancelShopOrder, isPending: isPendingShopOrderCancel } = useShopOrderCancel();
  const { mutateAsync: claimShopOrder } = useShopOrderClaim();

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
          <Dropdown.Menu.Item
            disabled={shopOrder.status !== ShopOrderOutputDTOStatusEnum.Paid}
            label="Claim order"
            icon={<ClaimOrderIcon />}
            onClick={handleClaimShopOrderClick}
          />
          <Dropdown.Menu.Item
            disabled={shopOrder.status !== ShopOrderOutputDTOStatusEnum.Paid}
            label="Cancel order"
            icon={<CancelOrderIcon />}
            onClick={handleCancelOrderClick}
          />
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

export const UserToPlayer: FC<{ userId: string }> = ({ userId }) => {
  const { data, isPending } = useQuery(userQueryOptions(userId));

  if (isPending) {
    return <Skeleton variant="rectangular" />;
  }

  if (data === undefined) {
    return 'unknown';
  }

  return <PlayerContainer playerId={data.playerId!} />;
};
