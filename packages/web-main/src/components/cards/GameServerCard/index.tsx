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
  Alert,
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
} from 'react-icons/ai';

import { Header, TitleContainer, DetailsContainer } from './style';
import { useGameServerRemove } from 'queries/gameserver';
import { PermissionsGuard } from 'components/PermissionsGuard';
import { CardBody } from '../style';
import { useSocket } from 'hooks/useSocket';
import { playersOnGameServersQueryOptions } from 'queries/pog';
import { useQuery } from '@tanstack/react-query';

export const GameServerCard: FC<GameServerOutputDTO> = ({ id, name, type, reachable }) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [valid, setValid] = useState<boolean>(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const { mutate, isPending: isDeleting } = useGameServerRemove();
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
    })
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

    e.shiftKey ? handleOnDelete() : setOpenDeleteDialog(true);
  };

  const handleOnDelete = () => {
    mutate({ gameServerId: id });
  };

  const handleOnCopyClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
  };

  return (
    <>
      <Card
        role="link"
        onClick={() =>
          navigate({
            to: '/gameserver/$gameServerId/dashboard/overview',
            params: { gameServerId: id },
          })
        }
        data-testid={`gameserver-${id}-card`}
      >
        <CardBody>
          <Header>
            {reachable ? <span>online</span> : <Chip label={'offline'} color="error" variant="outline" />}
            <PermissionsGuard requiredPermissions={[[PERMISSIONS.ReadGameservers, PERMISSIONS.ManageGameservers]]}>
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
                      onClick={() =>
                        navigate({ to: '/gameserver/$gameServerId/dashboard/overview', params: { gameServerId: id } })
                      }
                      label="go to dashboard"
                    />
                    <Dropdown.Menu.Item
                      icon={<ModulesIcon />}
                      onClick={() =>
                        navigate({ to: '/gameserver/$gameServerId/modules', params: { gameServerId: id } })
                      }
                      label="go to modules"
                    />
                    <Dropdown.Menu.Item
                      icon={<ModulesIcon />}
                      onClick={() => navigate({ to: '/gameserver/$gameServerId/shop', params: { gameServerId: id } })}
                      label="go to shop"
                    />
                    <Dropdown.Menu.Item
                      icon={<SettingsIcon />}
                      onClick={() =>
                        navigate({ to: '/gameserver/$gameServerId/settings', params: { gameServerId: id } })
                      }
                      label="go to settings"
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
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <Dialog.Content>
          <Dialog.Heading>delete: gameserver</Dialog.Heading>
          <Dialog.Body size="medium">
            <Alert
              variant="info"
              text="You can hold down shift when deleting a gameserver to bypass this confirmation entirely."
            />
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
              onClick={() => handleOnDelete()}
              disabled={!valid}
              fullWidth
              text="Delete gameserver"
              color="error"
            />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
