import { PlayerInventoryOutputDTO } from '@takaro/apiclient';
import { Table, useTableActions } from '@takaro/lib-components';
import { FC } from 'react';
import { createColumnHelper } from '@tanstack/react-table';

interface PlayerInventoryTableViewProps {
  inventory: PlayerInventoryOutputDTO[];
}

export const PlayerInventoryTableView: FC<PlayerInventoryTableViewProps> = ({ inventory }) => {
  const { columnFilters, sorting, columnSearch } = useTableActions();

  const columnHelper = createColumnHelper<PlayerInventoryOutputDTO>();
  const columns = [
    columnHelper.accessor('itemName', {
      id: 'itemName',
      header: 'Item Name',
      cell: (info) => info.getValue(),
      meta: {
        dataType: 'string',
      },
    }),
    columnHelper.accessor('quality', {
      id: 'quality',
      header: 'Quality',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('quantity', {
      id: 'quantity',
      header: 'Quantity',
      cell: (info) => info.getValue(),
      meta: {
        dataType: 'number',
      },
    }),
  ];

  return (
    <Table<PlayerInventoryOutputDTO>
      data={inventory}
      id="player-inventory-table"
      columns={columns}
      sorting={sorting}
      columnSearch={columnSearch}
      columnFiltering={columnFilters}
    />
  );
};
