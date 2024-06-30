import {
  ShopOrderOutputDTO,
  ShopOrderOutputDTOStatusEnum,
  ShopOrderSearchInputDTOSortDirectionEnum,
} from '@takaro/apiclient';
import { Button, Dialog, Dropdown, IconButton, Table, useTableActions } from '@takaro/lib-components';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { createColumnHelper } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { shopOrdersQueryOptions, useShopOrderCancel } from 'queries/shopOrder';
import { FC, useState } from 'react';
import { AiOutlineRight as ActionIcon } from 'react-icons/ai';
import { hasPermission } from 'hooks/useHasPermission';

export const Route = createFileRoute('/_auth/gameserver/$gameServerId/shop/orders')({
  beforeLoad: async ({ context }) => {
    const session = await context.auth.getSession();
    if (!hasPermission(session, ['READ_PLAYERS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
})!;

function Component() {
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
        id: columnFilters.columnFiltersState.find((filter) => filter.id === 'id')?.value,
        userId: columnFilters.columnFiltersState.find((filter) => filter.id === 'userId')?.value,
        listingId: columnFilters.columnFiltersState.find((filter) => filter.id === 'listingId')?.value,
        status: columnFilters.columnFiltersState.find((filter) => filter.id === 'status')?.value,
      },
      search: {
        id: columnSearch.columnSearchState.find((search) => search.id === 'id')?.value,
        userId: columnSearch.columnSearchState.find((search) => search.id === 'userId')?.value,
        listingId: columnSearch.columnSearchState.find((search) => search.id === 'listingId')?.value,
        status: columnSearch.columnSearchState.find((search) => search.id === 'status')?.value,
      },
    }),
  });

  // IMPORTANT: id should be identical to data object key.
  const columnHelper = createColumnHelper<ShopOrderOutputDTO>();
  const columnDefs = [
    columnHelper.accessor('id', {
      header: 'Order ID',
      id: 'id',
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('listingId', {
      header: 'Listing ID',
      id: 'listingId',
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('amount', {
      header: 'Amount',
      id: 'amount',
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      id: 'status',
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created At',
      id: 'createdAt',
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('updatedAt', {
      header: 'Updated At',
      id: 'updatedAt',
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
    }),
    columnHelper.display({
      header: 'Actions',
      id: 'actions',
      cell: (info) => <ShopOrderActions shopOrder={info.row.original} />,
    }),
  ];

  // since pagination depends on data, we need to make sure that data is not undefined
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
}

interface ShopOrderActionsProps {
  shopOrder: ShopOrderOutputDTO;
}

const ShopOrderActions: FC<ShopOrderActionsProps> = ({ shopOrder }) => {
  const [openCancelOrderDialog, setOpenCancelOrderDialog] = useState(false);
  const { mutate: cancelShopOrder, isPending: isPendingShopOrderCancel } = useShopOrderCancel();

  return (
    <>
      <Dropdown placement="left">
        <Dropdown.Trigger asChild>
          <IconButton icon={<ActionIcon />} ariaLabel="shop-order-actions" />
        </Dropdown.Trigger>
        <Dropdown.Menu>
          {shopOrder.status === ShopOrderOutputDTOStatusEnum.Paid && (
            <Dropdown.Menu.Item label="Claim order" icon={<ActionIcon />} onClick={() => {}} />
          )}
          {shopOrder.status === ShopOrderOutputDTOStatusEnum.Paid && (
            <Dropdown.Menu.Item label="Cancel order" icon={<ActionIcon />} onClick={() => {}} />
          )}
        </Dropdown.Menu>
      </Dropdown>
      <Dialog open={openCancelOrderDialog} onOpenChange={setOpenCancelOrderDialog}>
        <Dialog.Content>
          <Dialog.Heading>Shop Order: {shopOrder.id}</Dialog.Heading>
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
