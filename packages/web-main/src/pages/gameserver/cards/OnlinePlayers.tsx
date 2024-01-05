import { EventOutputDTO } from '@takaro/apiclient';
import { Loading, styled } from '@takaro/lib-components';
import { Player } from 'components/Player';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';
import { useSocket } from 'hooks/useSocket';
import { usePlayerOnGameServers, usePlayers } from 'queries/players/queries';
import { FC, useEffect } from 'react';

const PlayerCards = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  overflow-y: scroll;
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

  return (
    <>
      <h1>Online Players</h1>
      <PlayerCards>
        {data?.data.map((playerOnGameServer) => {
          const player = players?.data.find((player) => player.id === playerOnGameServer.playerId);
          if (!player) return null;

          return <Player playerId={player.id} />;
        })}
      </PlayerCards>
    </>
  );
};
