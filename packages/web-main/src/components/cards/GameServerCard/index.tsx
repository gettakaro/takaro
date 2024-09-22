import { FC, MouseEvent, useEffect, useState } from 'react';
import {
  Button,
  Chip,
  Dialog,
  Dropdown,
  IconButton,
  Tooltip,
  Card,
  Skeleton,
  useTheme,
  ValueConfirmationField,
} from '@takaro/lib-components';
import { EventOutputDTO, GameServerOutputDTO, PERMISSIONS } from '@takaro/apiclient';
import { useNavigate } from '@tanstack/react-router';
import {
  AiOutlineMenu as MenuIcon,
  AiOutlineDelete as DeleteIcon,
  AiOutlineEdit as EditIcon,
  AiOutlineLineChart as DashboardIcon,
  AiOutlineCopy as CopyIcon,
  AiOutlineFunction as ModulesIcon,
  AiOutlineSetting as SettingsIcon,
  AiOutlineStop as ShutdownIcon,
} from 'react-icons/ai';

import { Header, TitleContainer, DetailsContainer } from './style';
import { useGameServerRemove, useGameServerShutdown } from 'queries/gameserver';
import { PermissionsGuard } from 'components/PermissionsGuard';
import { CardBody } from '../style';
import { useSocket } from 'hooks/useSocket';
import { playersOnGameServersQueryOptions } from 'queries/pog';
import { useQuery } from '@tanstack/react-query';
import { useHasPermission } from 'hooks/useHasPermission';

const StatusChip: FC<{ reachable: boolean; enabled: boolean }> = ({ reachable, enabled }) => {
  if (!enabled) return <Chip label="disabled" color="warning" variant="outline" />;
  if (!reachable) return <Chip label="offline" color="error" variant="outline" />;
  return 'online';
};

export const GameServerCard: FC<GameServerOutputDTO> = ({ id, name, type, reachable, enabled }) => {
  const [openDeleteGameServerDialog, setOpenDeleteGameServerDialog] = useState<boolean>(false);
  const [openShutdownGameServerDialog, setOpenShutdownGameServerDialog] = useState<boolean>(false);

  const hasManageGameServerPermission = useHasPermission(['MANAGE_GAMESERVERS']);
  const { mutate: shutdownGameServer, isPending: isShuttingDown } = useGameServerShutdown();
  const [valid, setValid] = useState<boolean>(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const { mutate: removeGameServer, isPending: isDeleting } = useGameServerRemove();
  const { socket } = useSocket();
  const {
    data: onlinePogs,
    isLoading: isLoadingPogs,
    refetch,
  } = useQuery(
    playersOnGameServersQueryOptions({
      filters: {
        online: [true],
        gameServerId: [id],
      },
    }),
  );

  useEffect(() => {
    socket.on('event', (event: EventOutputDTO) => {
      if (event.eventName === 'player-connected') refetch();
      if (event.eventName === 'player-disconnected') refetch();
    });

    return () => {
      socket.off('event');
    };
  }, []);

  const handleOnEditClick = (e: MouseEvent): void => {
    e.stopPropagation();
    navigate({ to: '/gameservers/update/$gameServerId', params: { gameServerId: id } });
  };
  const handleOnDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey) {
      handleOnDelete();
    } else {
      setOpenDeleteGameServerDialog(true);
    }
  };

  const handleOnDelete = () => {
    removeGameServer({ gameServerId: id });
    setOpenDeleteGameServerDialog(false);
  };

  const handleOnShutdown = () => {
    shutdownGameServer(id);
    setOpenShutdownGameServerDialog(false);
  };

  const handleOnShutdownClick = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenShutdownGameServerDialog(true);
  };

  const handleOnCopyClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
  };

  return (
    <>
      <Card
        role="link"
        onClick={() => {
          navigate({
            to: '/gameserver/$gameServerId/dashboard/overview',
            params: { gameServerId: id },
          });
        }}
        data-testid={`gameserver-${id}-card`}
      >
        <CardBody>
          <Header>
            <StatusChip reachable={reachable} enabled={enabled} />
            <PermissionsGuard requiredPermissions={[[PERMISSIONS.ManageGameservers]]}>
              <Dropdown>
                <Dropdown.Trigger asChild>
                  <IconButton icon={<MenuIcon />} ariaLabel="Settings" />
                </Dropdown.Trigger>
                <Dropdown.Menu>
                  <Dropdown.Menu.Group label="Actions">
                    <Dropdown.Menu.Item icon={<CopyIcon />} onClick={handleOnCopyClick} label="Copy gameserverID" />
                    <Dropdown.Menu.Item
                      icon={<EditIcon />}
                      disabled={!hasManageGameServerPermission}
                      onClick={handleOnEditClick}
                      label="Edit gameserver"
                    />
                    <Dropdown.Menu.Item
                      icon={<DeleteIcon fill={theme.colors.error} />}
                      onClick={handleOnDeleteClick}
                      disabled={!hasManageGameServerPermission}
                      label="Delete gameserver"
                    />
                    <Dropdown.Menu.Item
                      icon={<ShutdownIcon fill={theme.colors.error} />}
                      label="Shutdown gameserver"
                      disabled={!hasManageGameServerPermission}
                      onClick={handleOnShutdownClick}
                    />
                  </Dropdown.Menu.Group>
                  <Dropdown.Menu.Group label="Navigation">
                    <Dropdown.Menu.Item
                      icon={<DashboardIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate({ to: '/gameserver/$gameServerId/dashboard/overview', params: { gameServerId: id } });
                      }}
                      label="Go to dashboard"
                    />
                    <Dropdown.Menu.Item
                      icon={<ModulesIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate({ to: '/gameserver/$gameServerId/modules', params: { gameServerId: id } });
                      }}
                      label="Go to modules"
                    />
                    <Dropdown.Menu.Item
                      icon={<ModulesIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate({ to: '/gameserver/$gameServerId/shop', params: { gameServerId: id } });
                      }}
                      label="Go to shop"
                    />
                    <Dropdown.Menu.Item
                      icon={<SettingsIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate({ to: '/gameserver/$gameServerId/settings', params: { gameServerId: id } });
                      }}
                      label="Go to settings"
                    />
                  </Dropdown.Menu.Group>
                </Dropdown.Menu>
              </Dropdown>
            </PermissionsGuard>
          </Header>
          <DetailsContainer>
            <TitleContainer>
              <h3>{name}</h3>
              <div>
                <Tooltip placement="bottom">
                  <Tooltip.Trigger asChild>
                    <p>{type}</p>
                  </Tooltip.Trigger>
                  <Tooltip.Content>Game server type</Tooltip.Content>
                </Tooltip>
              </div>
            </TitleContainer>
            <div>
              {isLoadingPogs && <Skeleton variant="rectangular" width="100px" height="15px" />}
              {!isLoadingPogs && !onlinePogs && <p>Online players: unknown</p>}
              {onlinePogs && <p>Online players: {onlinePogs?.data.length}</p>}
            </div>
          </DetailsContainer>
        </CardBody>
      </Card>
      <Dialog open={openDeleteGameServerDialog} onOpenChange={setOpenDeleteGameServerDialog}>
        <Dialog.Content>
          <Dialog.Heading>delete: gameserver</Dialog.Heading>
          <Dialog.Body size="medium">
            <p>
              Are you sure you want to delete the gameserver? To confirm, type <strong>{name}</strong> in the field
              below.
            </p>
            <ValueConfirmationField
              value={name}
              onValidChange={(v) => setValid(v)}
              label="Game server name"
              id="deleteGameServerConfirmation"
            />
            <Button
              isLoading={isDeleting}
              onClick={handleOnDelete}
              disabled={!valid}
              fullWidth
              text="Delete gameserver"
              color="error"
            />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
      <Dialog open={openShutdownGameServerDialog} onOpenChange={setOpenShutdownGameServerDialog}>
        <Dialog.Content>
          <Dialog.Heading>shutdown: gameserver</Dialog.Heading>
          <Dialog.Body size="medium">
            <p>
              The gameserver will be stopped gracefully. If the gameserver is not reachable, this will have no effect.
              Note that most hosting providers will automatically restart the gameserver after a shutdown, which makes
              this operator act as a restart instead. <br />
              <br /> Are you sure you want to <strong>shutdown</strong> <strong>{name}</strong>?
            </p>
            <p></p>
            <Button
              isLoading={isShuttingDown}
              onClick={handleOnShutdown}
              fullWidth
              text="Shutdown gameserver"
              color="error"
            />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
