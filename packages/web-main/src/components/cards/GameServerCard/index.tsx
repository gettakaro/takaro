import { FC, MouseEvent, useState } from 'react';
import { Button, Chip, Dialog, Dropdown, IconButton, Tooltip, Card } from '@takaro/lib-components';
import { PERMISSIONS } from '@takaro/apiclient';
import { Header, TitleContainer } from './style';
import { GameServerOutputDTO } from '@takaro/apiclient';
import { useNavigate } from 'react-router-dom';

import { AiOutlineMenu as MenuIcon } from 'react-icons/ai';
import { PATHS } from 'paths';
import { useGameServerRemove } from 'queries/gameservers';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { PermissionsGuard } from 'components/PermissionsGuard';
import { CardBody } from '../style';

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
      <Card role="link" onClick={() => navigate(PATHS.gameServer.dashboard(id))} data-testid={`gameserver-${id}-card`}>
        <CardBody>
          <Header>
            {reachable ? <span>online</span> : <Chip label={'offline'} color="error" variant="outline" />}
            <PermissionsGuard requiredPermissions={[[PERMISSIONS.ReadGameservers, PERMISSIONS.ManageGameservers]]}>
              <Dropdown>
                <Dropdown.Trigger asChild>
                  <IconButton icon={<MenuIcon />} ariaLabel="Settings" />
                </Dropdown.Trigger>
                <Dropdown.Menu>
                  <Dropdown.Menu.Item onClick={handleOnEditClick} label="Edit gameserver" />
                  <Dropdown.Menu.Item onClick={handleOnDeleteClick} label="Delete gameserver" />
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
        </CardBody>
      </Card>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <Dialog.Content>
          <Dialog.Heading>delete: gameserver</Dialog.Heading>
          <Dialog.Body size="medium">
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
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
