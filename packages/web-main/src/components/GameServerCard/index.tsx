import { FC, MouseEvent, useState } from 'react';
import {
  Button,
  Chip,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeading,
  Dropdown,
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
  min-width: 350px;
  height: 150px;
  border-radius: ${({ theme }) => theme.borderRadius.large}
  cursor: pointer;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateX(-5px);
  }
`;

const EmptyContainer = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background};
  border: 3px dashed ${({ theme }) => theme.colors.backgroundAlt};
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

const Body = styled.div`
  height: 100px;
  padding: ${({ theme }) => theme.spacing[2]};
`;

const Footer = styled.div`
  background-color: ${({ theme }) => theme.colors.secondary};
  border-bottom-right-radius: 5px;
  border-bottom-left-radius: 5px;
  height: 50px;
`;

const StyledDialogBody = styled(DialogBody)`
  h2 {
    margin-bottom: ${({ theme }) => theme.spacing['0_5']};
  }
  div {
    display: flex;
    flex-grow: 1;
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
          <h3>{name}</h3>
          <Dropdown
            open={openDropdown}
            setOpen={setOpenDropdown}
            renderReference={<MenuIcon size={18} />}
            renderFloating={
              <ul>
                <li onClick={handleOnEditClick}>Edit server</li>
                <li onClick={handleOnDeleteClick}>Delete server</li>
              </ul>
            }
          />
        </Header>
        <FloatingDelayGroup delay={{ open: 400, close: 200 }}>
          <Tooltip label="Game server type" placement="bottom">
            <Chip label={type} />
          </Tooltip>
          {!isLoading && data && (
            <Tooltip
              label="Can Takaro connect with your game server"
              placement="bottom"
            >
              <Chip
                label={`${
                  data.data.connectable ? 'connected' : 'disconnected'
                }`}
                color={data.data.connectable ? 'success' : 'error'}
              />
            </Tooltip>
          )}
        </FloatingDelayGroup>
      </Body>
      <Footer>
        {/* currently empty but could hold, fast navigation to certain pages of server e.g. console */}
      </Footer>

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
