import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useHasPermission } from '../../../hooks/useHasPermission';
import { ErrorBoundary } from '@sentry/react';
import { PERMISSIONS } from '@takaro/apiclient';
import { Button, Dropdown, IconButton, useLocalStorage, useTheme } from '@takaro/lib-components';
import { GameServersCardView } from './-gameservers/GameServersCardView';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { GameServersTableView } from './-gameservers/GameServersTableView';

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
} from 'react-icons/ai';
import { FC, MouseEvent, useRef, useState } from 'react';
import { PermissionsGuard } from '../../../components/PermissionsGuard';
import { TableListToggleButton } from '../../../components/TableListToggleButton';
import { GameServerDeleteDialog } from '../../../components/dialogs/GameServerDeleteDialog';
import { DeleteImperativeHandle } from '../../../components/dialogs';

type ViewType = 'list' | 'table';

export const Route = createFileRoute('/_auth/_global/gameservers')({
  errorComponent: () => <ErrorBoundary />,
  component: Component,
});

function Component() {
  useDocumentTitle('Game Servers');
  const { setValue: setView, storedValue: view } = useLocalStorage<ViewType>('gameservers-view-select', 'list');
  const navigate = Route.useNavigate();
  const theme = useTheme();
  const hasManageGameServersPermission = useHasPermission(['MANAGE_GAMESERVERS']);

  const onClickCreateGameServer = (e: MouseEvent) => {
    e.preventDefault();
    navigate({ to: '/gameservers/create' });
  };
  const onClickImportGameServer = (e: MouseEvent) => {
    e.preventDefault();
    navigate({ to: '/gameservers/create/import' });
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
        {hasManageGameServersPermission && (
          <Dropdown>
            <Dropdown.Trigger asChild>
              <Button icon={<MenuIcon />} text="Game Server Actions" />
            </Dropdown.Trigger>
            <Dropdown.Menu>
              <Dropdown.Menu.Group divider>
                <Dropdown.Menu.Item
                  icon={<CreateGameServerIcon />}
                  label="Create new game server"
                  onClick={onClickCreateGameServer}
                />
                <Dropdown.Menu.Item
                  icon={<ImportGameServerIcon />}
                  label="Import game server from CSMM"
                  onClick={onClickImportGameServer}
                />
              </Dropdown.Menu.Group>
            </Dropdown.Menu>
          </Dropdown>
        )}
        <TableListToggleButton onChange={setView} value={view} />
      </div>
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
  const gameServerDeleteDialogRef = useRef<DeleteImperativeHandle>(null);

  const navigate = useNavigate();

  const handleOnEditClick = (e: MouseEvent): void => {
    e.stopPropagation();
    navigate({ to: '/gameservers/update/$gameServerId', params: { gameServerId } });
  };
  const handleOnDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey) {
      gameServerDeleteDialogRef.current?.triggerDelete();
    } else {
      setOpenDeleteDialog(true);
    }
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
        <Dropdown>
          <Dropdown.Trigger asChild>
            <IconButton icon={<MenuIcon />} ariaLabel="Settings" />
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Menu.Group label="Actions">
              <Dropdown.Menu.Item icon={<CopyIcon />} onClick={handleOnCopyClick} label="Copy gameserverID" />
              <Dropdown.Menu.Item icon={<EditIcon />} onClick={handleOnEditClick} label="Edit gameserver" />
              <Dropdown.Menu.Item
                icon={<DeleteIcon fill={theme.colors.error} />}
                onClick={handleOnDeleteClick}
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
