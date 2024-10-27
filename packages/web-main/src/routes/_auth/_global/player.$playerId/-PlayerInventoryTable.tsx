import { FC, MouseEvent, useState } from 'react';
import { styled, Skeleton, Table, useTableActions, Button } from '@takaro/lib-components';
import { gameServerQueryOptions } from 'queries/gameserver';
import {
  GameServerOutputDTO,
  GameServerOutputDTOTypeEnum,
  IItemDTO,
  PlayerOnGameserverOutputDTO,
} from '@takaro/apiclient';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { GiveItemDialog } from 'components/GiveItemDialog';
import { AiOutlinePlus as GiveItemIcon } from 'react-icons/ai';

interface IPlayerInventoryProps {
  pog: PlayerOnGameserverOutputDTO;
}

const ItemIcon = styled.img`
  width: 25px;
  height: 25px;
`;

export const PlayerInventoryTable: FC<IPlayerInventoryProps> = ({ pog }) => {
  const { data: gameServer, isLoading } = useQuery(gameServerQueryOptions(pog.gameServerId));
  const [openGiveItemDialog, setOpenGiveItemDialog] = useState<boolean>(false);
  const { sorting, columnSearch, columnFilters } = useTableActions();
  if (isLoading) return <Skeleton variant="rectangular" width="100%" height="100%" />;

  if (pog.inventory.length === 0) return <p>No inventory data</p>;

  function getServerType(server: GameServerOutputDTO | undefined) {
    if (!server) return null;

    switch (server.type) {
      case GameServerOutputDTOTypeEnum.Rust:
        return 'rust';
      case GameServerOutputDTOTypeEnum.Sevendaystodie:
        return '7d2d';
      default:
        break;
    }
  }

  const placeholderIcon = '/favicon.ico';
  const serverType = getServerType(gameServer);

  function handleOnGiveItemClicked(e: MouseEvent) {
    e.stopPropagation();
    setOpenGiveItemDialog(true);
  }

  const columnHelper = createColumnHelper<IItemDTO>();
  const columnDefs = [
    columnHelper.display({
      header: 'icon',
      id: 'icon',
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: true,
      enablePinning: false,
      enableGlobalFilter: false,
      enableResizing: false,
      maxSize: 30,
      cell: (info) => (
        <ItemIcon
          src={serverType ? `/icons/${serverType}/${info.row.original.code}.png` : placeholderIcon}
          alt={info.row.original.name}
          onError={(e) => (e.currentTarget.src = placeholderIcon)}
        />
      ),
    }),
    columnHelper.accessor('name', {
      header: 'Item name',
      id: 'name',
      cell: (info) => info.getValue(),
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: true,
      enablePinning: false,
      enableGlobalFilter: false,
      enableResizing: false,
    }),
    columnHelper.accessor('amount', {
      header: 'Amount',
      id: 'amount',
      cell: (info) => info.getValue(),
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: true,
      enablePinning: false,
      enableGlobalFilter: false,
      enableResizing: false,
    }),
    columnHelper.accessor('quality', {
      header: 'Quality',
      id: 'quality',
      cell: (info) => info.getValue() ?? 'not set',
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: true,
      enablePinning: false,
      enableGlobalFilter: false,
      enableResizing: false,
    }),
  ];

  return (
    <>
      <Table
        data={pog.inventory}
        id="inventory"
        columns={columnDefs}
        columnSearch={columnSearch}
        sorting={sorting}
        columnFiltering={columnFilters}
        renderToolbar={() => <Button icon={<GiveItemIcon />} text="Give item" onClick={handleOnGiveItemClicked} />}
      />
      <GiveItemDialog
        gameServerId={pog.gameServerId}
        playerId={pog.playerId}
        open={openGiveItemDialog}
        setOpen={setOpenGiveItemDialog}
      />
    </>
  );
};
