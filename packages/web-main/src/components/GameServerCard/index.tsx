import { FC, MouseEvent, useState } from 'react';
import {
  Button,
  Chip,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeading,
  Dropdown,
  MenuList,
  styled,
  Tooltip,
} from '@takaro/lib-components';
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

const Container = styled.div`
  border-radius: ${({ theme }) => theme.borderRadius.large};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border: 2px solid ${({ theme }) => theme.colors.backgroundAlt};

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
  &:active {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const EmptyContainer = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background};
  border: 3px dashed ${({ theme }) => theme.colors.backgroundAlt};
  cursor: pointer;
  h3 {
    margin-left: ${({ theme }) => theme.spacing[1]};
  }
  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }
`;
const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  h3 {
    margin-bottom: ${({ theme }) => theme.spacing['0_5']};
  }
  p {
    width: fit-content;
    text-transform: lowercase;
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 160px;
  padding: ${({ theme }) => theme.spacing[2]};
`;

const StyledDialogBody = styled(DialogBody)`
  h2 {
    margin-bottom: ${({ theme }) => theme.spacing['0_5']};
  }
`;

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
                <MenuList.item onClick={handleOnEditClick}>
                  Edit server
                </MenuList.item>
                <MenuList.item onClick={handleOnDeleteClick}>
                  Delete server
                </MenuList.item>
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
