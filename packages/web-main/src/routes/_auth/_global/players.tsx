import { FC, Fragment, useState } from 'react';
import {
  styled,
  Table,
  useTableActions,
  IconButton,
  Dropdown,
  Dialog,
  Button,
  TextField,
  DateFormatter,
  CopyId,
  Chip,
} from '@takaro/lib-components';
import { PlayerOutputDTO, PERMISSIONS, PlayerSearchInputDTOSortDirectionEnum } from '@takaro/apiclient';
import { createColumnHelper, Row } from '@tanstack/react-table';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import {
  AiOutlineUser as ProfileIcon,
  AiOutlineEdit as EditIcon,
  AiOutlineRight as ActionIcon,
  AiOutlineUndo as UnBanIcon,
} from 'react-icons/ai';
import { DateTime, Duration } from 'luxon';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { hasPermission, useHasPermission } from 'hooks/useHasPermission';
import { useBanPlayerOnGameServer, useUnbanPlayerOnGameServer } from 'queries/gameserver';
import { playersQueryOptions } from 'queries/player';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import { FaBan as BanIcon } from 'react-icons/fa';
import { Player } from 'components/Player';
import { useQuery } from '@tanstack/react-query';
import { getApiClient } from 'util/getApiClient';
import { PlayerStats } from './-players/playerStats';
import { userMeQueryOptions } from 'queries/user';
import { GameServerContainer } from 'components/GameServer';

export const StyledDialogBody = styled(Dialog.Body)`
  h2 {
    margin-bottom: ${({ theme }) => theme.spacing['0_5']};
  }
`;
export const Route = createFileRoute('/_auth/_global/players')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['READ_PLAYERS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  component: Component,
});
function Component() {
  useDocumentTitle('Players');

  const { pagination, columnFilters, sorting, columnSearch } = useTableActions<PlayerOutputDTO>({ pageSize: 25 });
  const { data, isLoading } = useQuery(
    playersQueryOptions({
      page: pagination.paginationState.pageIndex,
      limit: pagination.paginationState.pageSize,
      extend: ['playerOnGameServers'],
      sortBy: sorting.sortingState[0]?.id,
      sortDirection: sorting.sortingState[0]?.desc
        ? PlayerSearchInputDTOSortDirectionEnum.Desc
        : PlayerSearchInputDTOSortDirectionEnum.Asc,
      filters: {
        name: columnFilters.columnFiltersState.find((filter) => filter.id === 'name')?.value,
        steamId: columnFilters.columnFiltersState.find((filter) => filter.id === 'steamId')?.value,
        epicOnlineServicesId: columnFilters.columnFiltersState.find((filter) => filter.id === 'epicOnlineServicesId')
          ?.value,
        xboxLiveId: columnFilters.columnFiltersState.find((filter) => filter.id === 'xboxLiveId')?.value,
      },
      search: {
        name: columnSearch.columnSearchState.find((search) => search.id === 'name')?.value,
        steamId: columnSearch.columnSearchState.find((search) => search.id === 'steamId')?.value,
        epicOnlineServicesId: columnSearch.columnSearchState.find((search) => search.id === 'epicOnlineServicesId')
          ?.value,
        xboxLiveId: columnSearch.columnSearchState.find((search) => search.id === 'xboxLiveId')?.value,
      },
    }),
  );

  const detailPanel = (row: Row<PlayerOutputDTO>) => {
    return (
      <>
        <tr className="subrow">
          <th></th>
          <th>Game Server</th>
          <th>Playtime</th>
          <th>Currency</th>
          <th>Ping</th>
          <th>First Seen</th>
          <th>Last seen</th>
          <th>Online</th>
          <th>IP address</th>
          <th />
        </tr>
        {row.original.playerOnGameServers?.map((pog) => {
          return (
            <tr key={'row-' + pog.playerId + pog.gameServerId} className="subrow">
              <td></td>
              <td>
                <GameServerContainer gameServerId={pog.gameServerId} />
              </td>
              <td>{Duration.fromObject({ seconds: pog.playtimeSeconds }).toHuman()}</td>
              <td>{pog.currency}</td>
              <td>{pog.ping}</td>
              <td>
                {DateTime.fromISO(pog.createdAt).toLocaleString({
                  month: 'numeric',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </td>
              <td>
                {DateTime.fromISO(pog.lastSeen).toLocaleString({
                  month: 'numeric',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </td>
              <td>
                <Chip color="secondary" label={pog.online ? 'Online' : 'Offline'} />
              </td>
              <td>{pog.ip ? pog.ip : 'Unknown'}</td>
            </tr>
          );
        })}
      </>
    );
  };

  const columnHelper = createColumnHelper<PlayerOutputDTO>();
  const columnDefs = [
    columnHelper.accessor('name', {
      header: 'Name',
      id: 'name',
      cell: (info) => {
        const name = info.getValue();
        if (!name) return '';

        const player = info.row.original;
        return <Player playerId={player.id} name={player.name} showAvatar={true} avatarUrl={player.steamAvatar} />;
      },
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('steamId', {
      header: 'Steam ID',
      id: 'steamId',
      cell: (info) => <CopyId placeholder={info.getValue()} id={info.getValue()} />,
      enableColumnFilter: true,
    }),

    columnHelper.accessor('epicOnlineServicesId', {
      header: 'EOS ID',
      id: 'epicOnlineServicesId',
      cell: (info) => <CopyId placeholder="EOS ID" id={info.getValue()} />,
      enableColumnFilter: true,
      enableSorting: true,
      meta: { hideColumn: true },
    }),
    columnHelper.accessor('xboxLiveId', {
      header: 'Xbox ID',
      id: 'xboxLiveId',
      cell: (info) => <CopyId placeholder="Xbox ID" id={info.getValue()} />,
      enableColumnFilter: true,
      enableSorting: true,
      meta: { hideColumn: true },
    }),

    columnHelper.accessor('steamAccountCreated', {
      header: 'Steam Account Created at',
      id: 'steamAccountCreated',
      cell: (info) => (info.getValue() ? <DateFormatter ISODate={info.getValue()!} /> : ''),
      enableSorting: true,
      meta: { hideColumn: true, dataType: 'datetime' },
    }),
    columnHelper.accessor('steamCommunityBanned', {
      header: 'Community Banned',
      id: 'steamCommunityBanned',
      cell: (info) => (info.getValue() ? <Chip variant="outline" color="error" label="yes" /> : 'no'),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('steamEconomyBan', {
      header: 'Economy Ban',
      id: 'steamEconomyBan',
      cell: (info) =>
        info.getValue() && info.getValue() !== 'none' ? (
          <Chip variant="outline" color="error" label={info.getValue() as string} />
        ) : (
          'none'
        ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('steamVacBanned', {
      header: 'VAC Banned',
      id: 'steamVacBanned',
      cell: (info) => (info.getValue() ? <Chip variant="outline" color="error" label="yes" /> : 'no'),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('steamNumberOfVACBans', {
      header: 'Number of VAC Bans',
      id: 'steamNumberOfVACBans',
      cell: (info) => `${info.getValue() ?? 0} ban${info.getValue() === 1 ? '' : 's'}`,
      enableSorting: true,
    }),
    columnHelper.accessor('steamsDaysSinceLastBan', {
      header: 'Days Since Last Ban',
      id: 'steamsDaysSinceLastBan',
      cell: (info) => info.getValue() ?? 'N/A',
      enableSorting: true,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created at',
      id: 'createdAt',
      meta: { dataType: 'datetime' },
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
      header: 'Actions',
      id: 'actions',
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: false,
      enablePinning: false,
      enableGlobalFilter: false,
      enableResizing: false,
      maxSize: 50,
      cell: (info) => <PlayerActions player={info.row.original} />,
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
    <Fragment>
      <PlayerStats />
      <Table
        title="List of players"
        id="players"
        columns={columnDefs}
        data={data?.data as PlayerOutputDTO[]}
        pagination={p}
        renderDetailPanel={(row) => detailPanel(row)}
        canExpand={(row) => (row.original.playerOnGameServers ? row.original.playerOnGameServers.length > 0 : false)}
        columnFiltering={columnFilters}
        columnSearch={columnSearch}
        sorting={sorting}
        isLoading={isLoading}
      />
    </Fragment>
  );
}

interface BanPlayerDialogProps {
  player: PlayerOutputDTO;
}

interface FormInputs {
  reason: string;
}

const PlayerActions: FC<BanPlayerDialogProps> = ({ player }) => {
  const [openBanDialog, setOpenBanDialog] = useState<boolean>(false);
  const [openUnbanDialog, setOpenUnbanDialog] = useState<boolean>(false);
  const hasManageRoles = useHasPermission([PERMISSIONS.ManageRoles]);
  // const hasManagePlayers = useHasPermission([PERMISSIONS.ManagePlayers]);

  const { enqueueSnackbar } = useSnackbar();

  const navigate = useNavigate({ from: Route.fullPath });

  const validationSchema = z.object({
    reason: z.string().min(1).max(100),
  });

  const { handleSubmit, control } = useForm<FormInputs>({
    resolver: zodResolver(validationSchema),
  });

  const { mutateAsync: mutateBanPlayer, isPending: isLoadingBanPlayer } = useBanPlayerOnGameServer();
  const { mutateAsync: mutateUnbanPlayer, isPending: isLoadingUnbanPlayer } = useUnbanPlayerOnGameServer();

  const handleOnBanPlayer: SubmitHandler<FormInputs> = async ({ reason }) => {
    const pogs = (
      await getApiClient().playerOnGameserver.playerOnGameServerControllerSearch({ filters: { playerId: [player.id] } })
    ).data.data;

    const bans = pogs.map((pog) => {
      return mutateBanPlayer({
        playerId: player.id,
        gameServerId: pog.gameServerId,
        opts: {
          reason: reason,
        },
      });
    });

    try {
      await Promise.all(bans);
      enqueueSnackbar(`${player.name} is banned from all your game servers.`, { variant: 'default', type: 'info' });
    } finally {
      setOpenBanDialog(false);
    }
  };

  const handleOnUnbanPlayer = async () => {
    const pogs = (
      await getApiClient().playerOnGameserver.playerOnGameServerControllerSearch({ filters: { playerId: [player.id] } })
    ).data.data;

    const bans = pogs.map((pog) => {
      return mutateUnbanPlayer({
        playerId: player.id,
        gameServerId: pog.gameServerId,
      });
    });

    try {
      await Promise.all(bans);
      enqueueSnackbar(`${player.name} is unbanned from all your game servers.`, { variant: 'default', type: 'info' });
    } finally {
      setOpenBanDialog(false);
    }
  };

  return (
    <>
      <Dropdown placement="left">
        <Dropdown.Trigger asChild>
          <IconButton icon={<ActionIcon />} ariaLabel="player-actions" />
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Menu.Item
            label="Go to player profile"
            icon={<ProfileIcon />}
            onClick={() => navigate({ to: '/player/$playerId/info', params: { playerId: player.id } })}
          />

          <Dropdown.Menu.Item
            label="Edit roles"
            icon={<EditIcon />}
            onClick={() => navigate({ to: '/player/$playerId/role/assign', params: { playerId: player.id } })}
            disabled={!hasManageRoles}
          />

          <Dropdown.Menu.Item
            label="Ban from ALL game servers (coming soon)"
            icon={<BanIcon />}
            onClick={async () => {
              setOpenBanDialog(true);
            }}
            disabled={true /*|| !hasManagePlayers*/}
          />
          <Dropdown.Menu.Item
            label="Unban from ALL game servers (coming soon)"
            icon={<UnBanIcon />}
            onClick={async () => {
              setOpenUnbanDialog(true);
            }}
            disabled={true /*|| !hasManagePlayers */}
          />
        </Dropdown.Menu>
      </Dropdown>

      <Dialog open={openBanDialog} onOpenChange={setOpenBanDialog}>
        <Dialog.Content>
          <Dialog.Heading>ban player: {player.name}</Dialog.Heading>
          <Dialog.Body size="medium">
            <form onSubmit={handleSubmit(handleOnBanPlayer)}>
              <p style={{ marginBottom: 0 }}>
                This will ban <strong>{player.name}</strong> from <strong>all</strong> your game servers?
              </p>
              <TextField control={control} name="reason" label="Ban Reason" placeholder="Cheating, Racism, etc." />
              <Button isLoading={isLoadingBanPlayer} type="submit" fullWidth text={'Ban player'} color="error" />
            </form>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
      <Dialog open={openUnbanDialog} onOpenChange={setOpenUnbanDialog}>
        <Dialog.Content>
          <Dialog.Heading>unban player</Dialog.Heading>
          <Dialog.Body size="medium">
            <p>
              this will unban <strong>{player.name}</strong> from <strong>all</strong> your game servers.
            </p>
            <Button
              isLoading={isLoadingUnbanPlayer}
              type="submit"
              fullWidth
              onClick={() => handleOnUnbanPlayer()}
              text={'Ban player'}
              color="error"
            />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
