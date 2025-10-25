import { EventOutputDTO, PlayerOutputDTO } from '@takaro/apiclient';
import { Card, Skeleton, styled } from '@takaro/lib-components';
import { Player } from './Player';
import { useSocket } from '../hooks/useSocket';
import { playersOnGameServersQueryOptions } from '../queries/pog';
import { FC, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';

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
  const { gameServerId } = getRouteApi('/_auth/gameserver/$gameServerId/dashboard/overview').useParams();
  const { socket } = useSocket();

  const { data, isPending, refetch } = useQuery(
    playersOnGameServersQueryOptions({
      filters: {
        online: [true],
        gameServerId: [gameServerId],
      },
      extend: ['player'],
    }),
  );

  useEffect(() => {
    socket.on('event', (event: EventOutputDTO) => {
      if (event.eventName === 'player-connected') refetch();
      if (event.eventName === 'player-disconnected') refetch();
    });

    return () => {
      socket.off('event');
    };
  }, []);

  if (isPending) return <Skeleton variant="rectangular" width="100%" height="100%" />;

  const players = data?.data.map((pog) => pog['player'] as PlayerOutputDTO) ?? [];

  return (
    <Card variant="outline">
      <Container>
        <Card.Title label={`${data?.data.length} Players Online`} />
        <Card.Body>
          <Players>
            {data?.data.map((playerOnGameServer) => {
              const player = players.find((player) => player.id === playerOnGameServer.playerId);
              if (!player) return null;
              return (
                <Player
                  key={player.id}
                  playerId={player.id}
                  name={player.name}
                  showAvatar={true}
                  avatarUrl={player.steamAvatar}
                  gameServerId={gameServerId}
                />
              );
            })}
          </Players>
        </Card.Body>
      </Container>
    </Card>
  );
};
