import { FC, useState } from 'react';
import { Chip, Dropdown, styled } from '@takaro/lib-components';
import {
  GameServerOutputDTO,
  GameServerSearchInputDTO,
  GameServerTestReachabilityDTOAPI,
  GameServerTestReachabilityInputDTO,
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

  const handleOnEdit = () => {
    /* TODO */
  };
  const handleOnDelete = () => {
    /* TODO */
  };

  if (!data || isLoading) {
    return <div>no data yet, loading</div>;
  }

  return (
    <Container onClick={() => navigate(`${PATHS.gameServers.overview}/${id}`)}>
      <Body>
        <Header>
          <h3>{name}</h3>
          <Dropdown
            open={open}
            setOpen={setOpen}
            renderReference={<MenuIcon size={18} />}
            renderFloating={
              <ul>
                <li onClick={handleOnEdit}>Edit server</li>
                <li onClick={handleOnDelete}>Delete server</li>
              </ul>
            }
          />
        </Header>
        <Chip label={type} />
        <Chip
          label={`${data.data.connectable ? 'online' : 'Offline'}`}
          color={data.data.connectable ? 'success' : 'error'}
        />
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
