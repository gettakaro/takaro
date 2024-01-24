import { EventOutputDTO } from '@takaro/apiclient';
import { Skeleton, styled } from '@takaro/lib-components';
import { Player } from 'components/Player';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { useSocket } from 'hooks/useSocket';
import { usePlayerOnGameServers } from 'queries/pog/queries';
import { usePlayers } from 'queries/players';
import { FC, useEffect } from 'react';
import { Card } from './style';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  height: 100%;
`;

const Players = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  overflow-y: auto;
  gap: ${({ theme }) => theme.spacing[1]};
`;

export const OnlinePlayersCard: FC = () => {
  const { selectedGameServerId } = useSelectedGameServer();
  const { socket } = useSocket();

  const { data, isLoading, refetch } = usePlayerOnGameServers({
    filters: {
      online: [true],
      gameServerId: [selectedGameServerId],
    },
    extend: ['player'],
  });

  const { data: players, isLoading: isLoadingPlayers } = usePlayers({
    filters: {
      id: data?.data.map((playerOnGameServer) => playerOnGameServer.playerId),
    },
  });

  useEffect(() => {
    socket.on('event', (event: EventOutputDTO) => {
      if (event.eventName === 'player-connected') refetch();
      if (event.eventName === 'player-disconnected') refetch();
    });

    return () => {
      socket.off('event');
    };
  }, []);

  if (isLoading || isLoadingPlayers) return <Skeleton variant="rectangular" width="100%" height="100%" />;

  return (
    <Card variant="outline">
      <Container>
        <h2>{data?.data.length} Players Online</h2>
        <Players>
          {data?.data.map((playerOnGameServer) => {
            const player = players?.data.find((player) => player.id === playerOnGameServer.playerId);
            if (!player) return null;

            return <Player playerId={player.id} name={player.name} showAvatar={true} avatarUrl={player.steamAvatar} />;
          })}
        </Players>
      </Container>
    </Card>
  );
};
