import { EventOutputDTO } from '@takaro/apiclient';
import { Loading, styled, useTheme } from '@takaro/lib-components';
import { Player } from 'components/Player';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { useSocket } from 'hooks/useSocket';
import { usePlayerOnGameServers, usePlayers } from 'queries/players/queries';
import { FC, useEffect } from 'react';
import { Scrollable, Card } from './style';

const Players = styled.div`
  display: flex;
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

  if (isLoading || isLoadingPlayers) return <Loading />;

  const theme = useTheme();

  return (
    <Card variant="outline">
      <Scrollable>
        <div style={{ display: 'flex', gap: theme.spacing[1], flexDirection: 'column' }}>
          <h2>{data?.data.length} Players Online</h2>
          <Players>
            {data?.data.map((playerOnGameServer) => {
              const player = players?.data.find((player) => player.id === playerOnGameServer.playerId);
              if (!player) return null;

              return (
                <Player playerId={player.id} name={player.name} showAvatar={true} avatarUrl={player.steamAvatar} />
              );
            })}
          </Players>
        </div>
      </Scrollable>
    </Card>
  );
};
