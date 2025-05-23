import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useHasPermission } from '../../../hooks/useHasPermission';
import { ErrorBoundary } from '@sentry/react';
import { PERMISSIONS } from '@takaro/apiclient';
import { Button, Dropdown, IconButton, useLocalStorage, useTheme } from '@takaro/lib-components';
import { GameServersCardView } from './-gameservers/GameServersCardView';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { GameServersTableView } from './-gameservers/GameServersTableView';

export interface GenericGameServersViewProps {
  setGameServerCount: (count: number) => void;
}

import {
  AiOutlinePlus as CreateGameServerIcon,
  AiOutlineImport as ImportGameServerIcon,
  AiOutlineMenu as MenuIcon,
  AiOutlineDelete as DeleteIcon,
  AiOutlineEdit as EditIcon,
  AiOutlineLineChart as DashboardIcon,
  AiOutlineCopy as CopyIcon,
  AiOutlineFunction as ModulesIcon,
  AiOutlineSetting as SettingsIcon,
  AiOutlineStop as ShutdownIcon,
  AiOutlineReload as ResetTokenIcon,
} from 'react-icons/ai';
import { FC, MouseEvent, useRef, useState } from 'react';
import { PermissionsGuard } from '../../../components/PermissionsGuard';
import { TableListToggleButton } from '../../../components/TableListToggleButton';
import { GameServerDeleteDialog } from '../../../components/dialogs/GameServerDeleteDialog';
import { GameServerResetTokenDialog } from '../../../components/dialogs/GameServerResetRegistrationToken';
import { DeleteImperativeHandle } from '../../../components/dialogs';
import { MaxUsage } from '../../../components/MaxUsage';
import { userMeQueryOptions } from '../../../queries/user';
import { gameServerCountQueryOptions } from '../../../queries/gameserver';
import { useQuery } from '@tanstack/react-query';
import { getCurrentDomain } from '../../../util/getCurrentDomain';
import { GameServerShutdownDialog } from '../../../components/dialogs/GameServerShutdownDialog';

type ViewType = 'list' | 'table';

export const Route = createFileRoute('/_auth/_global/gameservers')({
  loader: async ({ context }) => {
    return {
      userData: await context.queryClient.ensureQueryData(userMeQueryOptions()),
      currentGameServerCount: await context.queryClient.ensureQueryData(gameServerCountQueryOptions()),
    };
  },
  errorComponent: () => <ErrorBoundary />,
  component: Component,
});

function Component() {
  const loaderData = Route.useLoaderData();
  useDocumentTitle('Game Servers');
  const { data: me } = useQuery({ ...userMeQueryOptions(), initialData: loaderData.userData });
  const { data: currentGameServerCount } = useQuery({
    ...gameServerCountQueryOptions(),
    initialData: loaderData.currentGameServerCount,
  });

  const { setValue: setView, storedValue: view } = useLocalStorage<ViewType>('gameservers-view-select', 'list');
  const navigate = Route.useNavigate();
  const theme = useTheme();
  const hasManageGameServersPermission = useHasPermission(['MANAGE_GAMESERVERS']);
  const [openResetTokenDialog, setOpenResetTokenDialog] = useState<boolean>(false);

  const maxGameserverCount = getCurrentDomain(me).maxGameservers;
  const canCreateGameServer = currentGameServerCount < maxGameserverCount;

  const onClickCreateGameServer = (e: MouseEvent) => {
    e.preventDefault();
    navigate({ to: '/gameservers/create' });
  };
  const onClickImportGameServer = (e: MouseEvent) => {
    e.preventDefault();
    navigate({ to: '/gameservers/create/import' });
  };
  const onClickResetToken = (e: MouseEvent) => {
    e.preventDefault();
    setOpenResetTokenDialog(true);
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginBottom: '20px',
          gap: theme.spacing[1],
        }}
      >
        <MaxUsage value={currentGameServerCount} total={maxGameserverCount} unit="Gameservers" />
        {hasManageGameServersPermission && (
          <Dropdown>
            <Dropdown.Trigger asChild>
              <Button icon={<MenuIcon />}>Game Server Actions</Button>
            </Dropdown.Trigger>
            <Dropdown.Menu>
              <Dropdown.Menu.Group divider>
                <Dropdown.Menu.Item
                  icon={<CreateGameServerIcon />}
                  label="Create new game server"
                  onClick={onClickCreateGameServer}
                  disabled={!canCreateGameServer}
                />
                <Dropdown.Menu.Item
                  icon={<ImportGameServerIcon />}
                  label="Import game server from CSMM"
                  onClick={onClickImportGameServer}
                  disabled={!canCreateGameServer}
                />
                <Dropdown.Menu.Item
                  icon={<ResetTokenIcon />}
                  label="Reset registration token"
                  onClick={onClickResetToken}
                />
              </Dropdown.Menu.Group>
            </Dropdown.Menu>
          </Dropdown>
        )}
        <TableListToggleButton onChange={setView} value={view} />
      </div>
      <GameServerResetTokenDialog open={openResetTokenDialog} onOpenChange={setOpenResetTokenDialog} />
      {view === 'table' && <GameServersTableView />}
      {view === 'list' && <GameServersCardView />}
      <Outlet />
    </div>
  );
}

interface GameServerActionsProps {
  gameServerId: string;
  gameServerName: string;
}
export const GameServerActions: FC<GameServerActionsProps> = ({ gameServerId, gameServerName }) => {
  const theme = useTheme();
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openShutdownDialog, setOpenShutdownDialog] = useState<boolean>(false);
  const gameServerDeleteDialogRef = useRef<DeleteImperativeHandle>(null);

  const hasManageGameServerPermission = useHasPermission(['MANAGE_GAMESERVERS']);
  const navigate = useNavigate();

  const handleOnEditClick = (e: MouseEvent): void => {
    e.stopPropagation();
    e.preventDefault();
    navigate({ to: '/gameservers/update/$gameServerId', params: { gameServerId } });
  };
  const handleOnDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.shiftKey) {
      gameServerDeleteDialogRef.current?.triggerDelete();
    } else {
      setOpenDeleteDialog(true);
    }
  };
  const handleOnShutdownClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpenShutdownDialog(true);
  };

  const handleOnCopyClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(gameServerId);
  };

  return (
    <>
      <PermissionsGuard requiredPermissions={[[PERMISSIONS.ManageGameservers]]}>
        <GameServerDeleteDialog
          ref={gameServerDeleteDialogRef}
          open={openDeleteDialog}
          onOpenChange={setOpenDeleteDialog}
          gameServerId={gameServerId}
          gameServerName={gameServerName}
        />
        <GameServerShutdownDialog
          open={openShutdownDialog}
          onOpenChange={setOpenShutdownDialog}
          gameServerId={gameServerId}
          gameServerName={gameServerName}
        />
        <Dropdown>
          <Dropdown.Trigger asChild>
            <IconButton icon={<MenuIcon />} ariaLabel="Settings" />
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Menu.Group label="Actions">
              <Dropdown.Menu.Item icon={<CopyIcon />} onClick={handleOnCopyClick} label="Copy gameserver id" />
              <Dropdown.Menu.Item
                icon={<EditIcon />}
                onClick={handleOnEditClick}
                label="Edit gameserver"
                disabled={!hasManageGameServerPermission}
              />
              <Dropdown.Menu.Item
                icon={<ShutdownIcon fill={theme.colors.error} />}
                label="Shutdown gameserver"
                disabled={!hasManageGameServerPermission}
                onClick={handleOnShutdownClick}
              />
              <Dropdown.Menu.Item
                icon={<DeleteIcon fill={theme.colors.error} />}
                onClick={handleOnDeleteClick}
                disabled={!hasManageGameServerPermission}
                label="Delete gameserver"
              />
            </Dropdown.Menu.Group>
            <Dropdown.Menu.Group label="Navigation">
              <Dropdown.Menu.Item
                icon={<DashboardIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate({
                    to: '/gameserver/$gameServerId/dashboard/overview',
                    params: { gameServerId },
                  });
                }}
                label="go to dashboard"
              />
              <Dropdown.Menu.Item
                icon={<ModulesIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate({ to: '/gameserver/$gameServerId/modules', params: { gameServerId } });
                }}
                label="go to modules"
              />
              <Dropdown.Menu.Item
                icon={<ModulesIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate({ to: '/gameserver/$gameServerId/shop', params: { gameServerId } });
                }}
                label="go to shop"
              />
              <Dropdown.Menu.Item
                icon={<SettingsIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate({ to: '/gameserver/$gameServerId/settings', params: { gameServerId } });
                }}
                label="go to settings"
              />
            </Dropdown.Menu.Group>
          </Dropdown.Menu>
        </Dropdown>
      </PermissionsGuard>
    </>
  );
};
