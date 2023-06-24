import { FC, MouseEvent, useState } from 'react';
import {
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogHeading,
  Dropdown,
  MenuList,
  Skeleton,
  Tooltip,
} from '@takaro/lib-components';
import {
  Body,
  Header,
  Container,
  EmptyContainer,
  TitleContainer,
  StyledDialogBody,
} from './style';
import { FloatingDelayGroup } from '@floating-ui/react';
import { GameServerOutputDTO } from '@takaro/apiclient';
import { useNavigate } from 'react-router-dom';

import {
  AiOutlineMenu as MenuIcon,
  AiOutlinePlus as PlusIcon,
} from 'react-icons/ai';
import { PATHS } from 'paths';
import {
  useRemoveGameServer,
  useGameServerReachabilityById,
} from 'queries/gameservers';

export const GameServerCard: FC<GameServerOutputDTO> = ({ id, name, type }) => {
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const navigate = useNavigate();

  const { isLoading, data } = useGameServerReachabilityById(id);
  const { mutateAsync, isLoading: isDeleting } = useRemoveGameServer();

  const handleOnEditClick = (e: MouseEvent): void => {
    e.stopPropagation();
    navigate(PATHS.gameServers.update(id));
  };
  const handleOnDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenDialog(true);
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
            renderReference={<MenuIcon size={18} cursor="pointer" />}
            renderFloating={
              <MenuList>
                <MenuList.Item onClick={handleOnEditClick}>
                  Edit server
                </MenuList.Item>
                <MenuList.Item onClick={handleOnDeleteClick}>
                  Delete server
                </MenuList.Item>
              </MenuList>
            }
          />
        </Header>
        <FloatingDelayGroup delay={{ open: 400, close: 200 }}>
          <TitleContainer>
            <h3>{name}</h3>
            <div>
              <Tooltip label="Game server type" placement="bottom">
                <p>{type}</p>
              </Tooltip>
            </div>
          </TitleContainer>
        </FloatingDelayGroup>
      </Body>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeading>
            gameserver:{' '}
            <span style={{ textTransform: 'capitalize' }}>{name}</span>{' '}
          </DialogHeading>
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
        </DialogContent>
      </Dialog>
    </Container>
  );
};

interface EmptyGameServerCardProps {
  onClick: () => void;
}

export const EmptyGameServerCard: FC<EmptyGameServerCardProps> = ({
  onClick,
}) => {
  return (
    <EmptyContainer onClick={onClick}>
      <PlusIcon size={24} />
      <h3>new gameserver</h3>
    </EmptyContainer>
  );
};
