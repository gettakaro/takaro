import {
  Stats,
  styled,
  Skeleton,
  useTheme,
  Avatar,
  getInitials,
  HorizontalNav,
  IconButton,
  Dropdown,
} from '@takaro/lib-components';
import { Outlet, redirect, createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { DateTime } from 'luxon';
import { playerQueryOptions } from '../../../queries/player';
import { playersOnGameServersQueryOptions } from '../../../queries/pog';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { hasPermission, useHasPermission } from '../../../hooks/useHasPermission';
import { userMeQueryOptions } from '../../../queries/user';
import { useQueries } from '@tanstack/react-query';
import { AiOutlineDelete as DeleteIcon, AiOutlineEdit as EditIcon, AiOutlineRight as ActionIcon } from 'react-icons/ai';
import { FaBan as BanIcon } from 'react-icons/fa';
import { PlayerDeleteDialog } from '../../../components/dialogs/PlayerDeleteDialog';
import { PlayerBanDialog } from '../../../components/dialogs/PlayerBanDialog';
import { useState } from 'react';
import { PERMISSIONS } from '@takaro/apiclient';

export const Route = createFileRoute('/_auth/_global/player/$playerId')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(userMeQueryOptions());
    if (!hasPermission(session, ['READ_PLAYERS'])) {
      throw redirect({ to: '/forbidden' });
    }
  },
  loader: async ({ params, context }) => {
    const [player, pogs] = await Promise.all([
      context.queryClient.ensureQueryData(playerQueryOptions(params.playerId)),
      context.queryClient.ensureQueryData(
        playersOnGameServersQueryOptions({ filters: { playerId: [params.playerId] } }),
      ),
    ]);
    return { player, pogs };
  },
  component: Component,
  pendingComponent: () => <Skeleton variant="rectangular" width="100%" height="100%" />,
});

const Container = styled.div`
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['4']};
`;

const Header = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing['1']};
`;

function Component() {
  const { playerId } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openBanDialog, setOpenBanDialog] = useState(false);
  const hasManagePlayersPermission = useHasPermission([PERMISSIONS.ManagePlayers]);
  const hasManageRolesPermission = useHasPermission([PERMISSIONS.ManageRoles]);
  const navigate = useNavigate();

  const [{ data: player }, { data: pogs }] = useQueries({
    queries: [
      { ...playerQueryOptions(playerId), initialData: loaderData.player },
      { ...playersOnGameServersQueryOptions(), initialData: loaderData.pogs },
    ],
  });

  useDocumentTitle(player.name || 'Player Profile');
  const theme = useTheme();

  return (
    <Container>
      <Header>
        <Avatar size="large" variant="rounded">
          <Avatar.Image src={player.steamAvatar} />
          <Avatar.FallBack>{getInitials(player.name)}</Avatar.FallBack>
        </Avatar>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', flexGrow: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ lineHeight: 1 }}>{player.name}</h1>
            {(hasManagePlayersPermission || hasManageRolesPermission) && (
              <Dropdown placement="left">
                <Dropdown.Trigger asChild>
                  <IconButton icon={<ActionIcon />} ariaLabel="player-actions" />
                </Dropdown.Trigger>
                <Dropdown.Menu>
                  <Dropdown.Menu.Item
                    label="Edit roles"
                    icon={<EditIcon />}
                    onClick={() => navigate({ to: '/player/$playerId/role/assign', params: { playerId } })}
                    disabled={!hasManageRolesPermission}
                  />
                  <Dropdown.Menu.Item
                    label="Ban player"
                    icon={<BanIcon />}
                    onClick={() => setOpenBanDialog(true)}
                    disabled={!hasManagePlayersPermission}
                  />
                  <Dropdown.Menu.Item
                    label="Delete player"
                    icon={<DeleteIcon />}
                    onClick={() => setOpenDeleteDialog(true)}
                    disabled={!hasManagePlayersPermission}
                  />
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
          <div style={{ display: 'flex', gap: theme.spacing[2] }}>
            <Stats border={false} direction="horizontal">
              <Stats.Stat
                description="Member since"
                value={DateTime.fromISO(player.createdAt).toLocaleString({
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              />
              <Stats.Stat
                description="Last seen"
                value={DateTime.fromISO(player.updatedAt).toLocaleString({
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              />
              <Stats.Stat description="Joined servers" value={`${pogs.data.length ?? 0}`} />
            </Stats>
          </div>
        </div>
      </Header>

      <HorizontalNav variant="underline">
        <Link to="/player/$playerId/info" params={{ playerId }}>
          Info
        </Link>
        <Link to="/player/$playerId/events" params={{ playerId }}>
          Events
        </Link>
        <Link to="/player/$playerId/inventory" params={{ playerId }}>
          Inventory
        </Link>
        <Link to="/player/$playerId/economy" params={{ playerId }}>
          Economy
        </Link>
      </HorizontalNav>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
      <PlayerBanDialog open={openBanDialog} onOpenChange={setOpenBanDialog} playerId={player.id} />
      <PlayerDeleteDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        playerId={player.id}
        playerName={player.name}
      />
    </Container>
  );
}
