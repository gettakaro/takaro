import { FC, MouseEvent, useState } from 'react';
import { Chip, Dropdown, styled, Tooltip } from '@takaro/lib-components';
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
import { useQuery } from 'react-query';
import { useApiClient } from 'hooks/useApiClient';

const Container = styled.div`
  min-width: 350px;
  height: 150px;
  border-radius: 5px;
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

interface GameServerCardProps extends GameServerOutputDTO {}

export const GameServerCard: FC<GameServerCardProps> = ({ id, name, type }) => {
  const [open, setOpen] = useState<boolean>(false);
  const apiClient = useApiClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<GameServerTestReachabilityDTOAPI>(
    'testReachability',
    async () =>
      (await apiClient.gameserver.gameServerControllerTestReachabilityForId(id))
        .data
  );

  const handleOnEdit = (e: MouseEvent): void => {
    navigate(PATHS.gameServers.update(id));
  };
  const handleOnDelete = () => {
    /* TODO */
  };

  return (
    <Container onClick={() => navigate(PATHS.gameServer.dashboard(id))}>
      <Body>
        <Header>
          <h3>{name}</h3>
          <Dropdown
            open={open}
            setOpen={setOpen}
            renderReference={
              <MenuIcon size={18} onClick={() => setOpen(true)} />
            }
            renderFloating={
              <ul>
                <li onClick={handleOnEdit}>Edit server</li>
                <li onClick={handleOnDelete}>Delete server</li>
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
