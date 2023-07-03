import { FC, MouseEvent, useState } from 'react';
import { Button, Chip, Dialog, Dropdown, MenuList, Skeleton, IconButton, Tooltip } from '@takaro/lib-components';
import { Body, Header, Container, EmptyContainer, TitleContainer, StyledDialogBody } from './style';
import { GameServerOutputDTO } from '@takaro/apiclient';
import { useNavigate } from 'react-router-dom';

import { AiOutlineMenu as MenuIcon, AiOutlinePlus as PlusIcon } from 'react-icons/ai';
import { PATHS } from 'paths';
import { useGameServerRemove, useGameServerReachabilityById } from 'queries/gameservers';

export const GameServerCard: FC<GameServerOutputDTO> = ({ id, name, type }) => {
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const navigate = useNavigate();

  const { isLoading, data } = useGameServerReachabilityById(id);
  const { mutateAsync, isLoading: isDeleting } = useGameServerRemove();

  const handleOnEditClick = (e: MouseEvent): void => {
    e.stopPropagation();
    navigate(PATHS.gameServers.update(id));
    setOpenDropdown(false);
  };
  const handleOnDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenDialog(true);
    setOpenDropdown(false);
  };

  const handleOnDelete = async (e: MouseEvent) => {
    e.stopPropagation();
    await mutateAsync({ id });
    setOpenDialog(false);
  };

  const status = data?.data.connectable ? 'online' : 'offline';

  return (
    <Container onClick={() => navigate(PATHS.gameServer.dashboard(id))}>
      <Body>
        <Header>
          {isLoading || !data ? (
            <Skeleton variant="text" width="50px" height="15px" />
          ) : status === 'online' ? (
            <>{status}</>
          ) : (
            <Chip label={status} color="error" variant="outline" />
          )}
          <Dropdown
            open={openDropdown}
            setOpen={setOpenDropdown}
            renderReference={
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <IconButton icon={<MenuIcon />} ariaLabel="Actions" />
                </Tooltip.Trigger>
                <Tooltip.Content>Actions</Tooltip.Content>
              </Tooltip>
            }
            renderFloating={
              <MenuList>
                <MenuList.Item onClick={handleOnEditClick}>Edit server</MenuList.Item>
                <MenuList.Item onClick={handleOnDeleteClick}>Delete server</MenuList.Item>
              </MenuList>
            }
          />
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
              onClick={(e) => handleOnDelete(e)}
              fullWidth
              text={`Delete gameserver`}
              color="error"
            />
          </StyledDialogBody>
        </Dialog.Content>
      </Dialog>
    </Container>
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
