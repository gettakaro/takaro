import { FC, MouseEvent, useState } from 'react';
import { Button, Chip, Dialog, Dropdown, IconButton, Tooltip, PERMISSIONS } from '@takaro/lib-components';
import { Body, Header, Container, EmptyContainer, TitleContainer, StyledDialogBody } from './style';
import { GameServerOutputDTO } from '@takaro/apiclient';
import { useNavigate } from 'react-router-dom';

import { AiOutlineMenu as MenuIcon, AiOutlinePlus as PlusIcon } from 'react-icons/ai';
import { PATHS } from 'paths';
import { useGameServerRemove } from 'queries/gameservers';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { PermissionsGuard } from 'components/PermissionsGuard';

export const GameServerCard: FC<GameServerOutputDTO> = ({ id, name, type, reachable }) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const navigate = useNavigate();

  const { mutateAsync, isLoading: isDeleting } = useGameServerRemove();

  const { selectedGameServerId, setSelectedGameServerId } = useSelectedGameServer();

  const handleOnEditClick = (e: MouseEvent): void => {
    e.stopPropagation();
    navigate(PATHS.gameServers.update(id));
  };
  const handleOnDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();

    setOpenDialog(true);
  };

  const handleOnDelete = async () => {
    await mutateAsync({ id });

    // if the gameserver was selected, deselect it
    if (selectedGameServerId === id) {
      setSelectedGameServerId('');
    }
  };

  return (
    <>
      <Container
        onClick={() => navigate(PATHS.gameServer.dashboard(id))}
        tabIndex={0}
        data-testid={`gameserver-${id}-card`}
      >
        <Body>
          <Header>
            {reachable ? <span>online</span> : <Chip label={'offline'} color="error" variant="outline" />}
            <PermissionsGuard requiredPermissions={[[PERMISSIONS.READ_GAMESERVERS, PERMISSIONS.MANAGE_GAMESERVERS]]}>
              <Dropdown>
                <Dropdown.Trigger asChild>
                  <IconButton icon={<MenuIcon />} ariaLabel="Settings" />
                </Dropdown.Trigger>
                <Dropdown.Menu>
                  <Dropdown.Menu.Item onClick={handleOnEditClick} label="Edit server" />
                  <Dropdown.Menu.Item onClick={handleOnDeleteClick} label="Delete server" />
                </Dropdown.Menu>
              </Dropdown>
            </PermissionsGuard>
          </Header>
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
        </Body>
      </Container>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <Dialog.Content>
          <Dialog.Heading>
            gameserver: <span style={{ textTransform: 'capitalize' }}>{name}</span>{' '}
          </Dialog.Heading>
          <StyledDialogBody size="medium">
            <h2>Delete gameserver</h2>
            <p>
              Are you sure you want to delete <strong>{name}</strong>?
            </p>
            <Button
              isLoading={isDeleting}
              onClick={() => handleOnDelete()}
              fullWidth
              text={'Delete gameserver'}
              color="error"
            />
          </StyledDialogBody>
        </Dialog.Content>
      </Dialog>
    </>
  );
};

interface EmptyGameServerCardProps {
  onClick: () => void;
}

export const EmptyGameServerCard: FC<EmptyGameServerCardProps> = ({ onClick }) => {
  return (
    <EmptyContainer onClick={onClick}>
      <PlusIcon size={24} />
      <h3>Gameserver</h3>
    </EmptyContainer>
  );
};
