import { FC, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from 'react-query';
import { useApiClient } from 'hooks/useApiClient';
import { Skeleton, styled } from '@takaro/lib-components';
import { GameServerOutputArrayDTOAPI } from '@takaro/apiclient';
import {
  EmptyGameServerCard,
  GameServerCard,
} from '../components/GameServerCard';
import { PATHS } from 'paths';
import { useNavigate, Outlet } from 'react-router-dom';
import { QueryKeys } from 'queryKeys';

const List = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  grid-auto-rows: 160px;
  gap: ${({ theme }) => theme.spacing['1_5']};
`;

const GameServers: FC = () => {
  const client = useApiClient();
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useQuery<GameServerOutputArrayDTOAPI>({
    queryKey: QueryKeys.gameserver.list,
    queryFn: async () =>
      (await client.gameserver.gameServerControllerSearch()).data,
  });

  if (isLoading) {
    return (
      <Fragment>
        <List>
          <Skeleton variant="rectangular" height="100%" width="100%" />
          <Skeleton variant="rectangular" height="100%" width="100%" />
          <Skeleton variant="rectangular" height="100%" width="100%" />
          <Skeleton variant="rectangular" height="100%" width="100%" />
        </List>
      </Fragment>
    );
  }

  if (!data) {
    return <Fragment>Something went wrong</Fragment>;
  }

  return (
    <Fragment>
      <Helmet>
        <title>Gameservers - Takaro</title>
      </Helmet>
      <List>
        {data.data.map((gameServer) => (
          <GameServerCard
            key={gameServer.id}
            {...gameServer}
            refetch={refetch}
          />
        ))}
        <EmptyGameServerCard
          onClick={() => navigate(PATHS.gameServers.create())}
        />
      </List>
      <Outlet />
    </Fragment>
  );
};

export default GameServers;
