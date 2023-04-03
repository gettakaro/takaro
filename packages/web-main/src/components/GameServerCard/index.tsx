import { FC, MouseEvent, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeading,
  Dropdown,
  MenuList,
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
import {
  GameServerOutputDTO,
  GameServerTestReachabilityDTOAPI,
} from '@takaro/apiclient';
import { useNavigate } from 'react-router-dom';

import {
  AiOutlineMenu as MenuIcon,
  AiOutlinePlus as PlusIcon,
} from 'react-icons/ai';
import { PATHS } from 'paths';
import { useMutation, useQuery } from 'react-query';
import { useApiClient } from 'hooks/useApiClient';

interface GameServerCardProps extends GameServerOutputDTO {
  refetch: () => unknown;
}

export const GameServerCard: FC<GameServerCardProps> = ({
  id,
  name,
  type,
  refetch,
}) => {
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const apiClient = useApiClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<GameServerTestReachabilityDTOAPI>(
    'testReachability',
    async () =>
      (await apiClient.gameserver.gameServerControllerTestReachabilityForId(id))
        .data
  );

  const handleOnEditClick = (e: MouseEvent): void => {
    e.stopPropagation();
    navigate(PATHS.gameServers.update(id));
  };
  const handleOnDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenDialog(true);
  };

  const { mutateAsync, isLoading: isDeleting } = useMutation({
    mutationFn: async () =>
      await apiClient.gameserver.gameServerControllerRemove(id),
  });

  const handleOnDelete = async (e: MouseEvent) => {
    e.stopPropagation();
    await mutateAsync();
    setOpenDialog(false);
    refetch();
  };

  return (
    <Container onClick={() => navigate(PATHS.gameServer.dashboard(id))}>
      <Body>
        <Header>
          {!isLoading && data && (
            <Tooltip label="Takaro server reachability" placement="bottom">
              <div>{data.data.connectable ? 'online' : 'offline'}</div>
            </Tooltip>
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
          <DialogHeading>gameserver </DialogHeading>
          <StyledDialogBody size="medium">
            <h2>Delete gameserver</h2>
            <p>Are you sure you want to delete `{name}`?</p>
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
